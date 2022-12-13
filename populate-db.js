const fs = require("fs");
const models = require("./database/models");

const { parse } = require("csv-parse/sync");

// Carrega a lista de papéis a serem processados
const papeis = fs.readFileSync("../cotacoes-historicas/papeis.txt").toString().split("\n").map(p => p.trim());

// Índice do primeiro papel a ser processado
// const primeiroPapel = 642;

// Índice do último papel a ser processado
// const ultimoPapel = 642;

// Processar todos os papéis
const primeiroPapel = 0;
const ultimoPapel = papeis.length - 1;

void async function () {
	for (let p = primeiroPapel; p <= ultimoPapel; p++) {
		// Ignora linhas em branco na lista de papéis
		if (!papeis[p].length)
			continue;

		console.log(`[${papeis[p]}] Processando papel...`);

		// Carrega os dados do papel atual
		const registros = parse(fs.readFileSync(`../cotacoes-historicas/papeis/${papeis[p]}/tabela-bayes.csv`), {
			columns: true,
			delimiter: ",",
			skip_empty_lines: true,
			cast: true,
			trim: true
		});

		for (const reg of registros)
			reg.papel = papeis[p];

		await models.DadosBayes.bulkCreate(registros, { returning: false });
		console.log(`[${papeis[p]}] Dados do papel salvos.\n`);
	}
}();
