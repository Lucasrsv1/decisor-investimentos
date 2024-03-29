const dayjs = require("dayjs");
const fs = require("fs");
const { Op } = require("sequelize");
const { resolve } = require("path");

const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);

const models = require("../database/models");
const { b3Download, removeOldZips, loadCSV } = require("./b3-download");

// Carrega a lista de papéis a serem processados
const papeis = fs.readFileSync(resolve(__dirname, "../papeis.txt")).toString().split("\n").map(p => p.trim());

// Quantidade de dias a serem mantidos no histórico de variação de cada registro
const qtdDiasHist = 30;

/**
 * Classifica o resultado traduzindo o valor numérico na string da classe
 * @param {number} resultado percentual de valorização do dia seguinte
 * @returns
 */
function traduzResultado (resultado) {
	if (resultado < -0.01)
		return "R < -1%";

	if (resultado <= 0)
		return "-1% <= R <= 0%";

	if (resultado <= 0.01)
		return "0% < R <= 1%";

	return "R > 1%";
}

/**
 * Valida se os dados processados para um certo dia são válidos ou se possuem alguma inconsistência
 * @param {object} data Dados processados para um certo dia
 * @returns
 */
function isValid (data) {
	const ignore = ["data", "papel", "resultado", "sentido"];
	const keys = Object.keys(data).filter(k => !ignore.includes(k));
	for (const k of keys) {
		if (isNaN(data[k]) || Math.abs(data[k]) === Infinity)
			return false;
	}

	return true;
}

/**
 * Obtém os dados iniciais para calcular a tabela bayes do papel para o próximo dia
 * @param {string} ticket Papel a ser processado
 * @param {string} previousDate Data do registro anterior carregado diretamente do arquivo da B3
 * @returns
 */
async function getInitialInfo (ticket, previousDate) {
	let variacaoDiaAnteriorInicial = 0;
	const dadosAnteriores = {
		balanco: 0,
		dias_consecutivos: 0
	};

	const consultaDadosAnteriores = (await models.DadosBayes.findAll({
		attributes: ["data", "dias_consecutivos", "balanco", "variacao_acc_1", "sentido"],
		where: {
			papel: ticket,
			...( previousDate ? { data: { [Op.lt]: previousDate } } : {})
		},
		order: [["data", "DESC"]],
		limit: 1,
		raw: true
	}))[0];

	dadosAnteriores.balanco = Number(consultaDadosAnteriores.balanco);
	dadosAnteriores.dias_consecutivos = Number(consultaDadosAnteriores.dias_consecutivos);
	variacaoDiaAnteriorInicial = consultaDadosAnteriores.sentido === "VALORIZACAO" ? 1 : -1;

	if (consultaDadosAnteriores.sentido === "VALORIZACAO") {
		dadosAnteriores.balanco++;
		if (consultaDadosAnteriores.variacao_acc_1 > 0)
			dadosAnteriores.dias_consecutivos++;
		else
			dadosAnteriores.dias_consecutivos = 1;
	} else {
		dadosAnteriores.balanco--;
		if (consultaDadosAnteriores.variacao_acc_1 < 0)
			dadosAnteriores.dias_consecutivos--;
		else
			dadosAnteriores.dias_consecutivos = -1;
	}

	// Para calcular o histórico de variação de um dia é necessário
	// ter `qtdDiasHist` registros anteriores a ele e 1 posterior
	const precosAnteriores = await models.DadosBayes.findAll({
		attributes: ["data", "preco_abertura", "variacao_acc_1"],
		where: {
			papel: ticket,
			...( previousDate ? { data: { [Op.lt]: previousDate } } : {})
		},
		order: [["data", "DESC"]],
		limit: qtdDiasHist,
		raw: true
	});

	return { variacaoDiaAnteriorInicial, dadosAnteriores, precosAnteriores };
}

/**
 * Processa os dados de um papel e gera os dados a serem gravados na tabela bayes
 * @param {string} ticket Papel a ser processado
 * @param {Record<string, Array<{ data: string, fator: number }>>} mudancasCotas Registro de todas as mudanças (desdobramentos e grupamentos) de preço das cotas dos ativos
 * @returns
 */
async function calculateBayesForTicket (ticket, mudancasCotas) {
	// Carrega os dados do papel atual
	const registros = loadCSV(`papeis/${ticket}/dados.csv`, mudancasCotas);

	// Armazena dias já calculados
	const processado = [];

	const { variacaoDiaAnteriorInicial, dadosAnteriores, precosAnteriores } = await getInitialInfo(ticket);
	let variacaoDiaAnterior = variacaoDiaAnteriorInicial;

	// * r == 0 é o dado da última data já armazena na tabela bayes
	for (let r = 1; r < registros.length - 1; r++) {
		const variacaoDiaSeguinte = (registros[r + 1].preco_abertura / registros[r].preco_abertura) - 1;

		const diaProcessado = {
			// Dados do dia
			data: registros[r].data,
			papel: ticket,
			dias_passados: dayjs(registros[r].data).diff(registros[r - 1].data, "days"),
			preco_abertura: registros[r].preco_abertura,
			dias_consecutivos: dadosAnteriores.dias_consecutivos,
			balanco: dadosAnteriores.balanco,

			// Dados associados ao dia anterior
			variacao_preco_maximo_1: (registros[r].preco_abertura / registros[r - 1].preco_maximo) - 1,
			variacao_preco_minimo_1: (registros[r].preco_abertura / registros[r - 1].preco_minimo) - 1,
			variacao_preco_medio_1: (registros[r].preco_abertura / registros[r - 1].preco_medio) - 1,
			variacao_preco_ultimo_negocio_1: (registros[r].preco_abertura / registros[r - 1].preco_ultimo_negocio) - 1,
			variacao_preco_melhor_oferta_compra_1: (registros[r].preco_abertura / registros[r - 1].preco_melhor_oferta_compra) - 1,
			variacao_preco_melhor_oferta_venda_1: (registros[r].preco_abertura / registros[r - 1].preco_melhor_oferta_venda) - 1,
			volume_por_negociacao_1: registros[r - 1].volume_total / registros[r - 1].total_negociacoes,
			volume_total_1: registros[r - 1].volume_total
		};

		// Dados associados ao histórico dos últimos `qtdDiasHist` dias
		for (let d = 1; d <= qtdDiasHist; d++) {
			if (r - d > 0) {
				diaProcessado[`variacao_acc_${d}`] = (registros[r].preco_abertura / registros[r - d].preco_abertura) - 1;
				diaProcessado[`variacao_${d}`] = (registros[r - d].preco_abertura / registros[r - d - 1].preco_abertura) - 1;
			} else {
				diaProcessado[`variacao_acc_${d}`] = (registros[r].preco_abertura / Number(precosAnteriores[d - 1].preco_abertura)) - 1;
				diaProcessado[`variacao_${d}`] = Number(precosAnteriores[d - 1].variacao_acc_1);
			}
		}

		// Grava dias consecutivos de valorização ou desvalorização, e balanço de dias
		if (variacaoDiaSeguinte > 0) {
			dadosAnteriores.balanco++;
			if (variacaoDiaAnterior > 0)
				dadosAnteriores.dias_consecutivos++;
			else
				dadosAnteriores.dias_consecutivos = 1;
		} else {
			dadosAnteriores.balanco--;
			if (variacaoDiaAnterior < 0)
				dadosAnteriores.dias_consecutivos--;
			else
				dadosAnteriores.dias_consecutivos = -1;
		}

		variacaoDiaAnterior = variacaoDiaSeguinte;

		diaProcessado.resultado = traduzResultado(variacaoDiaSeguinte);
		diaProcessado.sentido = variacaoDiaSeguinte > 0 ? "VALORIZACAO" : "DESVALORIZACAO";

		if (!isValid(diaProcessado))
			console.warn(`[BAYES] Os dados do ticket ${ticket} para o dia ${diaProcessado.data} são inválidos. Dados ignorados:`, diaProcessado);
		else
			processado.push(diaProcessado);
	}

	return processado;
}

/**
 * Calcula a tabela bayes para os papéis informados em todas as datas pendentes
 * @param {string[]} tickets Vetor com os papéis a serem processados
 * @param {string} startDate Data inicial no formato YYYY-MM-DD
 * @param {string} endDate Data final no formato YYYY-MM-DD
 * @returns
 */
async function calculateBayes (tickets, startDate, endDate) {
	const everythingDownloaded = await b3Download(startDate, endDate);
	if (!everythingDownloaded)
		return console.error("[BAYES] Nem todos os dados da B3 foram baixados... cancelando job de cálculo da tabela bayes.");

	// Registro dos desdobramentos e grupamento das ações
	const mudancasCotas = JSON.parse(fs.readFileSync(resolve(__dirname, "../mudancas-cotas.json")));
	// TODO: atualizar arquivo de mudanças de cotas

	// Calcula a tabela bayes para todas as datas pendentes
	try {
		let bayesData = [];
		for (let t = 0; t < tickets.length; t++) {
			// Ignora linhas em branco na lista de papéis
			if (!tickets[t].length)
				continue;

			if (t % Math.floor(tickets.length / 10) === 0)
				console.log(`[BAYES] Calculando dados bayes para os ativos... ${(t / tickets.length * 100).toFixed(2)}%`);

			bayesData = bayesData.concat(await calculateBayesForTicket(tickets[t], mudancasCotas));
		}

		// Grava os dados no banco de dados
		if (bayesData.length > 0) {
			console.log(`[BAYES] Salvando ${bayesData.length} dados bayes no banco de dados...`);
			await models.DadosBayes.bulkCreate(bayesData);
			console.log(`[BAYES] ${bayesData.length} dados bayes foram salvos no banco de dados.`);
		} else {
			console.log("[BAYES] Nenhum dado bayes novo para salvar no banco de dados.");
		}
	} catch (error) {
		console.error("[BAYES] Erro ao gerar e salvar os dados da tabela bayes:", error);
	}
}

/**
 * Processa todos os papéis em todos os dias pendentes
 * @returns
 */
async function calculateBayesForAllTickets () {
	if (global.runningJobs.calculateBayesForAllTickets)
		return console.warn("[BAYES] Recusada a execução do job 'calculateBayesForAllTickets' por ele já estar em execução.");

	if (global.runningJobs.getTodaysBayes)
		return console.warn("[BAYES] Recusada a execução do job 'calculateBayesForAllTickets' devido ao fato de o job 'getTodaysBayes' estar em execução.");

	const today = dayjs().format("YYYY-MM-DD");
	const blockedInterval = [`${today} 09:55:00`, `${today} 10:41:00`];
	if (dayjs().isAfter(blockedInterval[0]) && dayjs().isBefore(blockedInterval[1]))
		return console.warn("[BAYES] Recusada a execução do job 'calculateBayesForAllTickets' para dar prioridade ao 'getTodaysBayes' de 09:55 às 10:41.");

	global.runningJobs.calculateBayesForAllTickets = true;

	try {
		const maxDate = await models.DadosBayes.max("data");
		await calculateBayes(papeis, maxDate, dayjs().format("YYYY-MM-DD"));

		// Deleta arquivos ZIP que não são mais necessários com base no maxDate
		removeOldZips(dayjs(maxDate).subtract(1, "day"));
	} catch (error) {
		console.error("[BAYES] Erro ao executar o job 'calculateBayesForAllTickets':", error);
	}

	global.runningJobs.calculateBayesForAllTickets = false;
}

module.exports = { calculateBayes, calculateBayesForAllTickets, getInitialInfo, qtdDiasHist };
