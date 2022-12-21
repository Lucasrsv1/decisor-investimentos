const axios = require("axios");
const { createWriteStream, rmSync, existsSync } = require("fs");
const stream = require("stream");
const { promisify } = require("util");

const finished = promisify(stream.finished);

async function downloadFile (fileUrl, outputPath, date) {
	const writer = createWriteStream(outputPath);

	try {
		const response = await axios({
			method: "get",
			url: fileUrl,
			responseType: "stream",
			timeout: 60000
		});

		response.data.pipe(writer);
		await finished(writer);

		if (date)
			console.log(`[DOWNLOAD FILE] Dados da data ${date} baixados.`);

		return true;
	} catch (error) {
		if (existsSync(outputPath))
			rmSync(outputPath, { force: true });

		// Se a resposta for 404 (Not found) é porque o dia em questão não teve pregão
		if (date && error.response && error.response.status === 404) {
			console.warn(`[DOWNLOAD FILE] Na data ${date} não houve pregão.`);
			return true;
		}

		console.error(`[DOWNLOAD FILE] Erro no download dos dados da data ${date}:`, error);
		return false;
	}
}

module.exports = { downloadFile };
