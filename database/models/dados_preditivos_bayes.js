const { Model, DataTypes } = require("sequelize");

class DadosPreditivosBayes extends Model {
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
function initDadosPreditivosBayes (sequelize) {
	DadosPreditivosBayes.init({
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false
		},
		papel: {
			type: DataTypes.STRING(12),
			allowNull: false
		},
		data: {
			type: DataTypes.DATEONLY,
			allowNull: false
		},
		dias_passados: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		preco_abertura: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		dias_consecutivos: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		balanco: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		variacao_preco_maximo_1: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_preco_minimo_1: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_preco_medio_1: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_preco_ultimo_negocio_1: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_preco_melhor_oferta_compra_1: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_preco_melhor_oferta_venda_1: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		volume_por_negociacao_1: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		volume_total_1: {
			type: DataTypes.DECIMAL(18, 2),
			allowNull: false
		},
		variacao_acc_1: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_1: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_2: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_2: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_3: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_3: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_4: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_4: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_5: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_5: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_6: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_6: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_7: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_7: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_8: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_8: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_9: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_9: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_10: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_10: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_11: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_11: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_12: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_12: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_13: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_13: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_14: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_14: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_15: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_15: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_16: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_16: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_17: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_17: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_18: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_18: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_19: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_19: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_20: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_20: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_21: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_21: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_22: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_22: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_23: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_23: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_24: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_24: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_25: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_25: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_26: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_26: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_27: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_27: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_28: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_28: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_29: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_29: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_acc_30: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		},
		variacao_30: {
			type: DataTypes.DECIMAL(30, 21),
			allowNull: false
		}
	}, {
		sequelize,
		timestamps: false,
		modelName: "DadosPreditivosBayes",
		tableName: "dados_preditivos_bayes",
		underscored: true
	});

	return DadosPreditivosBayes;
}

module.exports = { initDadosPreditivosBayes };
