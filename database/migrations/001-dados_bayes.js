"use strict";

module.exports = {
	/**
	 * Função de aplicação da migração
	 * @param {import("sequelize").QueryInterface} queryInterface
	 * @param {import("sequelize").DataTypes} Sequelize
	 */
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("dados_bayes", {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false
			},
			papel: {
				type: Sequelize.STRING(12),
				allowNull: false
			},
			data: {
				type: Sequelize.DATEONLY,
				allowNull: false
			},
			dias_passados: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			preco_abertura: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			dias_consecutivos: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			balanco: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			variacao_preco_maximo_1: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_preco_minimo_1: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_preco_medio_1: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_preco_ultimo_negocio_1: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_preco_melhor_oferta_compra_1: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_preco_melhor_oferta_venda_1: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			volume_por_negociacao_1: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			volume_total_1: {
				type: Sequelize.DECIMAL(18, 2),
				allowNull: false
			},
			variacao_acc_1: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_1: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_2: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_2: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_3: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_3: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_4: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_4: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_5: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_5: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_6: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_6: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_7: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_7: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_8: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_8: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_9: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_9: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_10: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_10: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_11: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_11: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_12: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_12: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_13: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_13: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_14: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_14: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_15: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_15: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_16: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_16: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_17: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_17: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_18: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_18: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_19: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_19: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_20: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_20: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_21: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_21: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_22: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_22: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_23: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_23: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_24: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_24: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_25: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_25: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_26: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_26: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_27: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_27: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_28: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_28: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_29: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_29: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_acc_30: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			variacao_30: {
				type: Sequelize.DECIMAL(30, 21),
				allowNull: false
			},
			resultado: {
				type: Sequelize.ENUM("R < -1%", "-1% <= R <= 0%", "0% < R <= 1%", "R > 1%"),
				allowNull: false
			},
			sentido: {
				type: Sequelize.ENUM("DESVALORIZACAO", "VALORIZACAO"),
				allowNull: false
			}
		});
	},

	/**
	 * Função que desfaz a migração
	 * @param {import("sequelize").QueryInterface} queryInterface
	 * @param {import("sequelize").Sequelize} Sequelize
	 */
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("dados_bayes");
	}
};
