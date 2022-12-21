"use strict";

module.exports = {
	/**
	 * Função de aplicação da migração
	 * @param {import("sequelize").QueryInterface} queryInterface
	 * @param {import("sequelize").DataTypes} Sequelize
	 */
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addIndex("dados_bayes", ["data", "papel"]);
	},

	/**
	 * Função que desfaz a migração
	 * @param {import("sequelize").QueryInterface} queryInterface
	 * @param {import("sequelize").Sequelize} Sequelize
	 */
	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeIndex("dados_bayes", ["data", "papel"]);
	}
};
