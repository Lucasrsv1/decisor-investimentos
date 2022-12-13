// Configura variáveis de ambiente o mais cedo possível
require("dotenv").config();

// Configura estampa de tempo dos logs
require("console-stamp")(console, { pattern: "yyyy-mm-dd HH:MM:ss.l" });

const { Axios } = require("axios");
const { Sequelize } = require("sequelize");

const models = require("./database/models");

const axios = new Axios({ baseURL: "http://127.0.0.1:5000/probabilities/" });
const simulations = [3, 5, 7, 10];

const investment = 5000;
const riskAversion = 3;
const greed = 1;

function getFactor (level, is1) {
	switch (level) {
		case 1:
			return is1 ? 0.01 : 0.005;
		case 2:
			return is1 ? 0.0125 : 0.0058;
		case 3:
			return is1 ? 0.015 : 0.0067;
		case 5:
			return is1 ? 0.02 : 0.0083;
		case 7:
			return is1 ? 0.025 : 0.01;
	}
}

void async function () {
	console.log("Carregando datas...");
	const dates = await models.DadosBayes.findAll({
		attributes: [
			[Sequelize.fn("DISTINCT", Sequelize.col("data")) ,"data"]
		],
		order: [["data", "ASC"]],
		raw: true
	});

	console.log(dates.length, "datas foram carregadas.\n");

	for (let d = 0; d < dates.length; d++) {
		const date = dates[d].data;
		console.log(`[${date}] Processando simulações do dia...`);

		try {
			const response = await axios.get(`${date}/${investment}`);
			if (response.status !== 200) {
				console.log(`[${date}] Não foi possível obter as probabilidades.`);
				continue;
			}

			const data = JSON.parse(response.data);
			if (data.code !== 200) {
				console.log(`[${date}] Não foi possível obter as probabilidades.`);
				continue;
			}

			let probabilities = data.probabilities;
			const realResults = data.real_results;

			const prizeTable = {
				invest: {
					r_1: investment * getFactor(riskAversion, true) * -1,
					r_05: investment * getFactor(riskAversion, false) * -1,
					r05: investment * getFactor(greed, false),
					r1: investment * getFactor(greed, true)
				},
				dontInvest: {
					r_1: 0,
					r_05: 0,
					r05: investment * getFactor(greed, false) * -1,
					r1: investment * getFactor(greed, true) * -1
				}
			};

			for (const probability of probabilities) {
				probability.prizes = {
					invest: (prizeTable.invest.r_1 * probability.r_1) +
							(prizeTable.invest.r_05 * probability.r_05) +
							(prizeTable.invest.r05 * probability.r05) +
							(prizeTable.invest.r1 * probability.r1),

					dontInvest: (prizeTable.dontInvest.r_1 * probability.r_1) +
								(prizeTable.dontInvest.r_05 * probability.r_05) +
								(prizeTable.dontInvest.r05 * probability.r05) +
								(prizeTable.dontInvest.r1 * probability.r1)
				};

				probability.shouldInvest = probability.prizes.invest > probability.prizes.dontInvest;
				probability.realResult = {
					precoAbertura: realResults[probability.ticket].preco_abertura,
					proximoPreco: realResults[probability.ticket].proximo_preco,
					result: realResults[probability.ticket].result
				};
			}

			probabilities = probabilities
				.filter(p => p.shouldInvest)
				.sort((a, b) => b.prizes.invest - a.prizes.invest);

			for (const qtyTickets of simulations) {
				const tickets = probabilities.slice(0, qtyTickets);
				const totalPrize = tickets.reduce((s, t) => s + Math.max(0, t.prizes.invest), 0);

				const simulationResult = { data: date };
				let resultadoTotal = 0;

				for (let idx = 0; idx < qtyTickets; idx++) {
					simulationResult[`papel_${idx + 1}`] = tickets[idx].ticket;
					simulationResult[`alocacao_papel_${idx + 1}`] = Math.max(0, tickets[idx].prizes.invest / totalPrize);
					simulationResult[`resultado_papel_${idx + 1}`] = tickets[idx].realResult.result || 1;

					resultadoTotal += simulationResult[`resultado_papel_${idx + 1}`] * simulationResult[`alocacao_papel_${idx + 1}`];
				}

				simulationResult.resultado_total = resultadoTotal;
				await models[`SimulacaoTop${qtyTickets}`].create(simulationResult);
				console.log(`[${date}] Simulação Top ${qtyTickets} salva.`);
			}
		} catch (error) {
			console.error(`[${date}] Erro ao calcular decisão.`, error);
		}

		console.log(`Progresso total: ${((d + 1) / dates.length * 100).toFixed(3)}%.\n`);
	}
}();
