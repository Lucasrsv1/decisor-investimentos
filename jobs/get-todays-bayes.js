const { Axios } = require("axios");
const dayjs = require("dayjs");
const { parse } = require("node-html-parser");
const { readFileSync } = require("fs");
const { resolve } = require("path");

const { getInitialInfo, qtdDiasHist } = require("./calculate-bayes");
const models = require("../database/models");
const { sleep } = require("../utils/sleep");
const { b3Download, loadCSV } = require("./b3-download");

const axios = new Axios({ baseURL: "https://br.advfn.com/bolsa-de-valores/bovespa" });

// Carrega a lista de papéis a serem processados
const papeis = readFileSync(resolve(__dirname, "../papeis.txt")).toString().split("\n").map(p => p.trim());

/**
 * Define quantos papéis podem ser processados ao mesmo tempo para diminuir
 * o tempo de carregamento para processar todos os mais de 1000 papéis.
 */
const MAX_PARALLEL_REQUESTS = 80;

/**
 * Obtém o preço de abertura para o papel em questão no pregão atual
 * @param {string} ticket Papel a ser processado
 * @returns
 */
async function getTodaysPriceForTicket (ticket) {
	try {
		const response = await axios.get(`/${ticket}/cotacao`, {
			headers: { "Accept-Encoding": "gzip,deflate,compress" },
			timeout: 10000
		});

		if (response.status !== 200) {
			console.error(`[TODAY'S BAYES] [${ticket}] Não foi possível obter os dados do papel. Status da Requisição: ${response.status} (${response.statusText})`, response.data);
			return null;
		}

		const root = parse(response.data);
		const marketOpened = root.querySelector("span.session-text").innerText.toLowerCase().trim() === "mercado aberto";
		if (!marketOpened) {
			console.log(`[TODAY'S BAYES] [${ticket}] Mercado ainda não aberto para o papel.`);
			return null;
		}

		const divs = root.querySelectorAll("div.TableElement");
		for (const div of divs) {
			const row = div.querySelectorAll("table tr th").findIndex(th => th.innerText.toLowerCase().trim() === "preço de abertura");
			if (row !== -1) {
				const strValue = div.querySelectorAll("table tr td")[row].innerText.trim();
				if (!strValue.length) {
					console.log(`[TODAY'S BAYES] [${ticket}] Nenhum preço de abertura encontrado para o papel.`);
					break;
				}

				return parseFloat(strValue.replace(",", "."));
			}
		}
	} catch (error) {
		console.error(`[TODAY'S BAYES] [${ticket}] Não foi possível obter os dados do papel.`, error);
	}

	return null;
}

/**
 * Calcula as métricas da tabela bayes para serem usados na predição de um certo papel
 * @param {string} ticket Papel a ser processado
 * @param {object} registroPregaoAnterior Dados do pregão anterior para o papel em questão
 * @returns
 */
async function getTodaysBayesForTicket (ticket, registroPregaoAnterior) {
	const data = dayjs().format("YYYY-MM-DD");
	const price = await getTodaysPriceForTicket(ticket);
	if (!price || price <= 0 || !registroPregaoAnterior)
		return null;

	const { variacaoDiaAnteriorInicial, dadosAnteriores, precosAnteriores } = await getInitialInfo(ticket);
	const variacaoPregaoAnterior = (price / registroPregaoAnterior.preco_abertura) - 1;

	if (variacaoPregaoAnterior > 0) {
		dadosAnteriores.balanco++;
		if (variacaoDiaAnteriorInicial > 0)
			dadosAnteriores.dias_consecutivos++;
		else
			dadosAnteriores.dias_consecutivos = 1;
	} else {
		dadosAnteriores.balanco--;
		if (variacaoDiaAnteriorInicial < 0)
			dadosAnteriores.dias_consecutivos--;
		else
			dadosAnteriores.dias_consecutivos = -1;
	}

	const diaProcessado = {
		// Dados do dia
		data,
		papel: ticket,
		dias_passados: dayjs().diff(registroPregaoAnterior.data, "days"),
		preco_abertura: price,
		dias_consecutivos: dadosAnteriores.dias_consecutivos,
		balanco: dadosAnteriores.balanco,

		// Dados associados ao dia anterior
		variacao_preco_maximo_1: (price / registroPregaoAnterior.preco_maximo) - 1,
		variacao_preco_minimo_1: (price / registroPregaoAnterior.preco_minimo) - 1,
		variacao_preco_medio_1: (price / registroPregaoAnterior.preco_medio) - 1,
		variacao_preco_ultimo_negocio_1: (price / registroPregaoAnterior.preco_ultimo_negocio) - 1,
		variacao_preco_melhor_oferta_compra_1: (price / registroPregaoAnterior.preco_melhor_oferta_compra) - 1,
		variacao_preco_melhor_oferta_venda_1: (price / registroPregaoAnterior.preco_melhor_oferta_venda) - 1,
		volume_por_negociacao_1: registroPregaoAnterior.volume_total / registroPregaoAnterior.total_negociacoes,
		volume_total_1: registroPregaoAnterior.volume_total,
		variacao_acc_1: (price / registroPregaoAnterior.preco_abertura) - 1,
		variacao_1: (registroPregaoAnterior.preco_abertura / Number(precosAnteriores[0].preco_abertura)) - 1
	};

	// Dados associados ao histórico dos últimos `qtdDiasHist` dias
	for (let d = 2; d <= qtdDiasHist; d++) {
		diaProcessado[`variacao_acc_${d}`] = (price / Number(precosAnteriores[d - 2].preco_abertura)) - 1;
		diaProcessado[`variacao_${d}`] = Number(precosAnteriores[d - 2].variacao_acc_1);
	}

	return diaProcessado;
}

/**
 * Calcula os dados da tabela bayes para o dia de hoje a fim de possibilitar predições logo no início do pregão
 * @returns
 */
async function getTodaysBayes () {
	if (global.runningJobs.getTodaysBayes)
		return console.warn("[TODAY'S BAYES] Recusada a execução do job 'getTodaysBayes' por ele já estar em execução.");

	if (global.runningJobs.calculateBayesForAllTickets)
		return console.warn("[TODAY'S BAYES] Recusada a execução do job 'getTodaysBayes' devido ao fato de o job 'calculateBayesForAllTickets' estar em execução.");

	global.runningJobs.getTodaysBayes = true;

	try {
		// Registro dos desdobramentos e grupamento das ações
		const mudancasCotas = JSON.parse(readFileSync(resolve(__dirname, "../mudancas-cotas.json")));

		// Obtém dados do pregão anterior
		const maxDate = await models.DadosBayes.max("data");
		let downloadedDate = null;
		let everythingDownloaded = false;
		for (let d = dayjs(maxDate).add(1, "day"); d.isSameOrBefore(dayjs(), "date") && !everythingDownloaded; d = d.add(1, "day")) {
			downloadedDate = d.clone();
			everythingDownloaded = await b3Download(d.format("YYYY-MM-DD"), d.format("YYYY-MM-DD"), false);
		}

		// Se não conseguiu baixar os dados do último pregão, aborta o procedimento
		if (!everythingDownloaded)
			throw new Error("Não foi possível baixar os dados do último pregão.");

		const registrosPregaoAnterior = loadCSV(`COTAHIST_D${downloadedDate.format("DDMMYYYY")}.csv`, mudancasCotas);

		// Seleciona os papéis já processados hoje para não recalcular
		const processedTickets = (await models.DadosPreditivosBayes.findAll({
			attributes: ["papel"],
			where: { data: dayjs().format("YYYY-MM-DD") }
		})).map(t => t.papel);

		const filteredTickets = papeis.filter(p => !processedTickets.includes(p));

		const rows = [];
		const promises = [];
		for (let t = 0; t < filteredTickets.length; t++) {
			// Ignora linhas em branco na lista de papéis
			if (!filteredTickets[t].length) continue;

			promises.push(
				getTodaysBayesForTicket(filteredTickets[t], registrosPregaoAnterior.find(r => r.papel === filteredTickets[t])).then(row => {
					if (row) rows.push(row);
				})
			);

			if (promises.length >= MAX_PARALLEL_REQUESTS) {
				await Promise.all(promises.splice(0));

				// Aguarda 2 segundos antes de solicitar os próximos papéis
				await sleep(2000);
				console.log(`[TODAY'S BAYES] Obtendo preços de abertura de hoje... ${(t / filteredTickets.length * 100).toFixed(2)}%`);
			}
		}

		await Promise.all(promises.splice(0));

		if (rows.length > 0) {
			console.log(`[TODAY'S BAYES] Salvando ${rows.length} dados no banco de dados...`);
			// Salva os dados calculados em uma tabela no banco de dados
			await models.DadosPreditivosBayes.bulkCreate(rows, { returning: false });
			console.log(`[TODAY'S BAYES] ${rows.length} dados salvos no banco de dados.`);
		} else {
			console.log("[TODAY'S BAYES] Nenhum novo dado para salvar no banco de dados.");
		}
	} catch (error) {
		console.error("[TODAY'S BAYES] Erro ao executar o job 'getTodaysBayes':", error);
	}

	global.runningJobs.getTodaysBayes = false;
}

module.exports = { getTodaysBayes };
