"use strict";

const qtyTickets = [3, 5, 7, 10];

module.exports = {
	/**
	 * Função de aplicação da migração
	 * @param {import("sequelize").QueryInterface} queryInterface
	 * @param {import("sequelize").DataTypes} Sequelize
	 */
	up: async (queryInterface, Sequelize) => {
		const columns = Array(qtyTickets.length).fill(0).map(_ => ({
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false
			},
			data: {
				type: Sequelize.DATEONLY,
				allowNull: false,
				unique: true
			},
			resultado_total: {
				type: Sequelize.DECIMAL(20, 17),
				allowNull: false
			}
		}));

		for (let i = 0; i < qtyTickets.length; i++) {
			for (let t = 1; t <= qtyTickets[i]; t++) {
				columns[i][`papel_${t}`] = {
					type: Sequelize.STRING(12),
					allowNull: false
				};
				columns[i][`alocacao_papel_${t}`] = {
					type: Sequelize.DECIMAL(20, 17),
					allowNull: false
				};
				columns[i][`resultado_papel_${t}`] = {
					type: Sequelize.DECIMAL(20, 17),
					allowNull: false
				};
				columns[i][`volume_medio_${t}`] = {
					type: Sequelize.DECIMAL(18, 2),
					allowNull: false
				};
			}

			await queryInterface.createTable(`simulacao_top_${qtyTickets[i]}`, columns[i]);
		}
	},

	/**
	 * Função que desfaz a migração
	 * @param {import("sequelize").QueryInterface} queryInterface
	 * @param {import("sequelize").Sequelize} Sequelize
	 */
	down: async (queryInterface, Sequelize) => {
		for (const t of qtyTickets)
			await queryInterface.dropTable(`simulacao_top_${t}`);
	}
};
