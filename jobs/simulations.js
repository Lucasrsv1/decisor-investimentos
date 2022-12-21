const { Axios } = require("axios");
const { Sequelize, Op } = require("sequelize");

const models = require("../database/models");

const axios = new Axios({ baseURL: process.env.PYTHON_SERVER + "/probabilities/" });
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

async function runSimulations () {
	console.log("[SIMULATIONS] Carregando datas...");
	const maxDate = (await models.SimulacaoTop3.max("data")) || "2001-12-31";
	const dates = await models.DadosBayes.findAll({
		attributes: [
			[Sequelize.fn("DISTINCT", Sequelize.col("data")) ,"data"]
		],
		where: {
			data: { [Op.gt]: maxDate }
		},
		order: [["data", "ASC"]],
		raw: true
	});

	// Não processa a simulação do último dia, pois ainda não tem os dados de resultado
	dates.pop();

	console.log("[SIMULATIONS]", dates.length, "datas foram carregadas.\n");

	for (let d = 0; d < dates.length; d++) {
		const date = dates[d].data;
		console.log(`[SIMULATIONS] [${date}] Processando simulações do dia...`);

		try {
			const response = await axios.get(`${date}/${investment}`);
			if (response.status !== 200) {
				console.log(`[SIMULATIONS] [${date}] Não foi possível obter as probabilidades.`);
				continue;
			}

			const data = JSON.parse(response.data);
			if (data.code !== 200) {
				console.log(`[SIMULATIONS] [${date}] Não foi possível obter as probabilidades.`);
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
					volumeMedio: realResults[probability.ticket].volume_medio,
					result: realResults[probability.ticket].result
				};
			}

			probabilities = probabilities
				.filter(p => p.shouldInvest)
				.sort((a, b) => b.prizes.invest - a.prizes.invest);

			for (const qtyTickets of simulations) {
				const tickets = probabilities.slice(0, qtyTickets);

				// Encontra o valor mínimo para tratar a alocação nos casos de prêmio esperado negativo
				let minPrize = tickets.reduce((m, t) => Math.min(m, t.prizes.invest), Infinity);
				if (minPrize > 0)
					minPrize = 0;
				else
					minPrize = Math.abs(minPrize);

				const totalPrize = tickets.reduce((s, t) => s + (minPrize + t.prizes.invest), 0);
				const simulationResult = { data: date };
				let resultadoTotal = 0;

				for (let idx = 0; idx < qtyTickets; idx++) {
					simulationResult[`papel_${idx + 1}`] = tickets[idx].ticket;
					simulationResult[`alocacao_papel_${idx + 1}`] = (minPrize + tickets[idx].prizes.invest) / totalPrize;
					simulationResult[`resultado_papel_${idx + 1}`] = tickets[idx].realResult.result || 1;
					simulationResult[`volume_medio_${idx + 1}`] = tickets[idx].realResult.volumeMedio;

					resultadoTotal += simulationResult[`resultado_papel_${idx + 1}`] * simulationResult[`alocacao_papel_${idx + 1}`];
				}

				simulationResult.resultado_total = resultadoTotal;
				await models[`SimulacaoTop${qtyTickets}`].create(simulationResult);
				console.log(`[SIMULATIONS] [${date}] Simulação Top ${qtyTickets} salva.`);
			}
		} catch (error) {
			console.error(`[SIMULATIONS] [${date}] Erro ao calcular decisão.`, error);
		}

		console.log(`[SIMULATIONS] Progresso total: ${((d + 1) / dates.length * 100).toFixed(3)}%.\n`);
	}
}

module.exports = { runSimulations };
