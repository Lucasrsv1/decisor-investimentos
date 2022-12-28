const dayjs = require("dayjs");
const fs = require("fs");
const { parse } = require("csv-parse/sync");
const { resolve } = require("path");

const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);

const { downloadFile } = require("../utils/download-file");
const { exec } = require("child_process");

const rawDataFolder = resolve(__dirname, "raw-data");
const txtFolder = resolve(__dirname, "raw-data", "extracted-txt");
const csvFolder = resolve(__dirname, "raw-data", "generated-csv");

// Shell Scripts
const txtToCSV = resolve(__dirname, "txt-to-csv.sh").replace(/ /g, "\\ ");
const separarPorPapel = resolve(__dirname, "separar-por-papel.sh").replace(/ /g, "\\ ");

if (!fs.existsSync(rawDataFolder))
	fs.mkdirSync(rawDataFolder);

/**
 * Limpa as pastas dos arquivos TXT e CSV
 */
function removeTempFiles () {
	console.log("[B3 DOWNLOAD] Eliminando arquivos temporários...");
	if (fs.existsSync(txtFolder))
		fs.rmSync(txtFolder, { force: true, recursive: true });

	if (fs.existsSync(csvFolder))
		fs.rmSync(csvFolder, { force: true, recursive: true });

	fs.mkdirSync(txtFolder);
	fs.mkdirSync(csvFolder);
	console.log("[B3 DOWNLOAD] Arquivos temporários eliminados.");
}

/**
 * Remove os arquivos .ZIP antigos que não serão mais usados
 * @param {dayjs.Dayjs} minDate Data mínima para o .ZIP ser mantido (todos anteriores serão eliminados)
 */
function removeOldZips (minDate) {
	const files = fs.readdirSync(rawDataFolder).filter(a => a.startsWith("COTAHIST_D") && a.endsWith(".ZIP"));
	for (const file of files) {
		const date = dayjs(`${file.substr(14, 4)}-${file.substr(12, 2)}-${file.substr(10, 2)}`);
		if (date.isSameOrBefore(minDate, "date")) {
			console.log("[B3 DOWNLOAD] Deletando .ZIP antigo:", file);
			fs.rmSync(resolve(rawDataFolder, file), { force: true });
		}
	}
}

/**
 * Faz o download dos dados brutos da B3 para todos os ativos desejados em um intervalo de dias
 * @param {string} startDate Data inicial no formato YYYY-MM-DD
 * @param {string} endDate Data final no formato YYYY-MM-DD
 * @returns
 */
async function downloadB3Data (startDate, endDate) {
	const files = [];
	for (let d = dayjs(startDate); d.isSameOrBefore(endDate); d = d.add(1, "day")) {
		const fileName = `COTAHIST_D${d.format("DDMMYYYY")}.ZIP`;
		const fileInfo = {
			url: `https://bvmf.bmfbovespa.com.br/InstDados/SerHist/${fileName}`,
			path: resolve(rawDataFolder, fileName),
			date: d.format("DD/MM/YYYY")
		};

		// Não baixa de novo arquivo que já foi baixado
		if (fs.existsSync(fileInfo.path))
			continue;

		files.push(fileInfo);
	}

	let success = true;
	for (const file of files)
		success = (await downloadFile(file.url, file.path, file.date)) && success;

	return success;
}

/**
 * Processa ZIP de uma data e gera o CSV inicial
 * @param {dayjs.Dayjs} date Data a ter os dados carregados
 * @returns
 */
async function generateCSVForDate (date) {
	const fileName = `COTAHIST_D${date.format("DDMMYYYY")}`;
	const zipPath = resolve(rawDataFolder, fileName + ".ZIP");
	const txtPath = resolve(txtFolder, fileName + ".TXT");
	const csvPath = resolve(csvFolder, fileName + ".csv");

	// Extrai o arquivo TXT da data
	await new Promise((resolve, reject) => {
		console.log(`[B3 DOWNLOAD] Extraindo ZIP do dia ${date.format("DD/MM/YYYY")}`);
		exec(`unzip -o "${zipPath}" -d "${txtFolder}"`, error => {
			if (error) {
				console.error(`[B3 DOWNLOAD] Erro ao extrair ZIP do dia ${date.format("DD/MM/YYYY")}:`, error);
				reject(error);
			}

			console.log(`[B3 DOWNLOAD] ZIP do dia ${date.format("DD/MM/YYYY")} extraído.`);
			resolve();
		});
	});

	// Gera CSV inicial para a data
	await new Promise((resolve, reject) => {
		console.log(`[B3 DOWNLOAD] Gerando CSV inicial do dia ${date.format("DD/MM/YYYY")}`);
		exec(`${txtToCSV} "${txtPath}" "${csvPath}"`, error => {
			if (error) {
				console.error(`[B3 DOWNLOAD] Erro ao gerar CSV inicial do dia ${date.format("DD/MM/YYYY")}:`, error);
				reject(error);
			}

			console.log(`[B3 DOWNLOAD] CSV inicial do dia ${date.format("DD/MM/YYYY")} gerado.`);
			resolve();
		});
	});
}

/**
 * Faz o download dos dados da B3 e separa por papel
 * @param {string} startDate Data inicial no formato YYYY-MM-DD
 * @param {string} endDate Data final no formato YYYY-MM-DD
 * @param {boolean} separate Define se deve separar o CSV por papel
 * @param {boolean} ensureFileExists Garante que só retornará verdadeiro se os arquivos de todos os dias do intervalo realmente existirem no HD
 * @returns
 */
async function b3Download (startDate, endDate, separate = true, ensureFileExists = false) {
	removeTempFiles();

	const everythingDownloaded = await downloadB3Data(startDate, endDate);
	if (!everythingDownloaded)
		return false;

	// Gera o CSV para todas as datas pendentes
	let inexistentFiles = false;
	for (let d = dayjs(startDate); d.isSameOrBefore(dayjs().format("YYYY-MM-DD")); d = d.add(1, "day")) {
		// Ignora dia que não teve pregão
		if (!fs.existsSync(resolve(rawDataFolder, `COTAHIST_D${d.format("DDMMYYYY")}.ZIP`))) {
			inexistentFiles = true;
			continue;
		}

		await generateCSVForDate(d);
	}

	// Finaliza execução se não for para separar por papel
	if (!separate)
		return true;

	// Finaliza execução se os arquivos eram necessários para todos os dias
	if (ensureFileExists && inexistentFiles)
		return false;

	// Separa o CSV por papel
	await new Promise((resolve, reject) => {
		console.log("[B3 DOWNLOAD] Separando CSV por papel.");
		exec(`${separarPorPapel} "${__dirname}"`, error => {
			if (error) {
				console.error("[B3 DOWNLOAD] Erro ao separar CSV por papel:", error);
				reject(error);
			}

			console.log("[B3 DOWNLOAD] CSV separado por papel.");
			resolve();
		});
	});

	return true;
}

/**
 * Carrega um arquivo CSV de dados da B3
 * @param {string} filePath Caminho para o arquivo CSV a ser carregado
 * @param {Record<string, Array<{ data: string, fator: number }>>} mudancasCotas Registro de todas as mudanças (desdobramentos e grupamentos) de preço das cotas dos ativos
 * @returns
 */
function loadCSV (filePath, mudancasCotas) {
	// Carrega os dados do papel atual
	const registros = parse(fs.readFileSync(resolve(csvFolder, filePath)), {
		columns: true,
		delimiter: ";",
		skip_empty_lines: true,
		cast: true,
		trim: true
	});

	// Ordena os dados em ordem crescente
	registros.sort((a, b) => dayjs(a.data) - dayjs(b.data));

	// Ajusta os preços considerando os centavos
	for (const reg of registros) {
		reg.preco_abertura = reg.preco_abertura / 100;
		reg.preco_maximo = reg.preco_maximo / 100;
		reg.preco_minimo = reg.preco_minimo / 100;
		reg.preco_medio = reg.preco_medio / 100;
		reg.preco_ultimo_negocio = reg.preco_ultimo_negocio / 100;
		reg.volume_total = reg.volume_total / 100;

		if (reg.preco_melhor_oferta_compra)
			reg.preco_melhor_oferta_compra = reg.preco_melhor_oferta_compra / 100;
		else
			reg.preco_melhor_oferta_compra = reg.preco_abertura;

		if (reg.preco_melhor_oferta_venda)
			reg.preco_melhor_oferta_venda = reg.preco_melhor_oferta_venda / 100;
		else
			reg.preco_melhor_oferta_venda = reg.preco_abertura;

		if (mudancasCotas && mudancasCotas[reg.papel]) {
			for (const { data, fator } of mudancasCotas[reg.papel]) {
				// Segue em frente se a mudança na cota foi depois do dia desse registro
				if (dayjs(reg.data) < dayjs(data))
					continue;

				// Aplica fator de desdobramento ou grupamento das cotas
				reg.preco_abertura *= fator;
				reg.preco_maximo *= fator;
				reg.preco_minimo *= fator;
				reg.preco_medio *= fator;
				reg.preco_ultimo_negocio *= fator;

				reg.preco_melhor_oferta_compra *= fator;
				reg.preco_melhor_oferta_venda *= fator;
			}
		}
	}

	return registros;
}

module.exports = { b3Download, loadCSV, removeOldZips };
