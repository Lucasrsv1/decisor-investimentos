const { Model, DataTypes } = require("sequelize");

class SimulacaoTop7 extends Model {
	/**
	 * Cria as associações entre as tabelas do banco de dados
	 * @param {import("./index")} models Modelos das tabelas do banco de dados
	 */
	static associate (models) { }
}

/**
 * Cria o modelo da tabela
 * @param {import("sequelize").Sequelize} sequelize conexão com o banco de dados
 * @returns
 */
function initSimulacaoTop7 (sequelize) {
	SimulacaoTop7.init({
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false
		},
		data: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			unique: true
		},
		resultado_total: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		},
		papel_1: {
			type: DataTypes.STRING(12),
			allowNull: false
		},
		alocacao_papel_1: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		},
		resultado_papel_1: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		},
		papel_2: {
			type: DataTypes.STRING(12),
			allowNull: false
		},
		alocacao_papel_2: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		},
		resultado_papel_2: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		},
		papel_3: {
			type: DataTypes.STRING(12),
			allowNull: false
		},
		alocacao_papel_3: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		},
		resultado_papel_3: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		},
		papel_4: {
			type: DataTypes.STRING(12),
			allowNull: false
		},
		alocacao_papel_4: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		},
		resultado_papel_4: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		},
		papel_5: {
			type: DataTypes.STRING(12),
			allowNull: false
		},
		alocacao_papel_5: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		},
		resultado_papel_5: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		},
		papel_6: {
			type: DataTypes.STRING(12),
			allowNull: false
		},
		alocacao_papel_6: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		},
		resultado_papel_6: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		},
		papel_7: {
			type: DataTypes.STRING(12),
			allowNull: false
		},
		alocacao_papel_7: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		},
		resultado_papel_7: {
			type: DataTypes.DECIMAL(20, 17),
			allowNull: false
		}
	}, {
		sequelize,
		timestamps: false,
		modelName: "SimulacaoTop7",
		tableName: "simulacao_top_7",
		underscored: true
	});

	return SimulacaoTop7;
}

module.exports = { initSimulacaoTop7 };
