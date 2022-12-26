const Sequelize = require("sequelize");

const configs = require("../config/config");

const { initDadosBayes } = require("./dados_bayes");
const { initDadosPreditivosBayes } = require("./dados_preditivos_bayes");
const { initSimulacaoTop10 } = require("./simulacao_top_10");
const { initSimulacaoTop3 } = require("./simulacao_top_3");
const { initSimulacaoTop5 } = require("./simulacao_top_5");
const { initSimulacaoTop7 } = require("./simulacao_top_7");

const env = process.env.NODE_ENV || "development";
const config = configs[env];

if (config.logging)
	config.logging = console.log;

config.pool = {
	max: 85,
	min: 0,
	idle: 5000,
	evict: 5000
};

/**
 * @type {Sequelize} conexão com o banco de dados
 */
let sequelize;

// Se houver variável de ambiente do Heroku ou produção...
if (process.env.DATABASE_URL)
	sequelize = new Sequelize(process.env.DATABASE_URL, config);
else
	sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {
	db: sequelize,

	// Carrega arquivos de modelos das tabelas
	DadosBayes: initDadosBayes(sequelize),
	DadosPreditivosBayes: initDadosPreditivosBayes(sequelize),
	SimulacaoTop3: initSimulacaoTop3(sequelize),
	SimulacaoTop5: initSimulacaoTop5(sequelize),
	SimulacaoTop7: initSimulacaoTop7(sequelize),
	SimulacaoTop10: initSimulacaoTop10(sequelize)
};

// Cria as associações das tabelas
Object.keys(db).forEach(modelName => {
	if ("associate" in db[modelName])
		db[modelName].associate(db);
});

module.exports = db;
