const { Axios } = require("axios");
const { param } = require("express-validator");

const { isRequestInvalid } = require("../utils/http-validation");

const axios = new Axios({ baseURL: "http://127.0.0.1:5000/probabilities/" });

class Decision {
	/**
	 * @param {import("express").Request} req
	 * @param {import("express").Response} res
	 */
	async getDecision (req, res) {
		if (isRequestInvalid(req, res)) return;

		try {
			const response = await axios.get(`${req.params.date}/${req.params.investment}`);
			if (response.status !== 200) {
				return res.status(500).json({
					message: "Não foi possível obter as probabilidades.",
					error: response.data
				});
			}

			const data = JSON.parse(response.data);
			if (data.code !== 200) {
				return res.status(500).json({
					message: "Não foi possível obter as probabilidades.",
					error: data
				});
			}

			const probabilities = data.probabilities;
			const realResults = data.real_results;

			const prizeTable = {
				invest: {
					r_1: req.params.investment * instance._getFactor(req.params.riskAversion, true) * -1,
					r_05: req.params.investment * instance._getFactor(req.params.riskAversion, false) * -1,
					r05: req.params.investment * instance._getFactor(req.params.greed, false),
					r1: req.params.investment * instance._getFactor(req.params.greed, true)
				},
				dontInvest: {
					r_1: 0,
					r_05: 0,
					r05: req.params.investment * instance._getFactor(req.params.greed, false) * -1,
					r1: req.params.investment * instance._getFactor(req.params.greed, true) * -1
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

			probabilities.sort((a, b) => b.prizes.invest - a.prizes.invest);

			res.status(200).json({ prizeTable, probabilities });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Erro ao calcular decisão.", error });
		}
	}

	get validations () {
		return [
			param("date").isDate({ format: "YYYY-MM-DD" })
				.withMessage("Data inválida. Padrão requerido: YYYY-MM-DD."),
			param("investment").isNumeric({ min: 1 })
				.withMessage("O valor do investimento deve ser maior ou igual a R$ 1,00.").toFloat(),
			param("riskAversion").isIn([1, 2, 3, 5, 7])
				.withMessage("O nível de aversão a risco tem que ser entre 1, 2, 3, 5 ou 7.").toInt(),
			param("greed").isIn([1, 2, 3, 5, 7])
				.withMessage("O nível de ganância tem que ser entre 1, 2, 3, 5 ou 7.").toInt()
		];
	}

	_getFactor (level, is1) {
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
}

const instance = new Decision();

module.exports = instance;
