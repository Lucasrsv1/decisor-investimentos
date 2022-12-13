// Configura variáveis de ambiente o mais cedo possível
require("dotenv").config();

// Configura estampa de tempo dos logs
require("console-stamp")(console, { pattern: "yyyy-mm-dd HH:MM:ss.l" });

const cors = require("cors");
const path = require("path");
const express = require("express");
const logger = require("morgan");

const routes = require("./routes");

const app = express();
app.set("port", process.env.PORT || 3000);

app.use(logger("[:date[clf]] :method :url :status :response-time ms - :res[content-length]"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
	origin: "*",
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	preflightContinue: true,
	optionsSuccessStatus: 200
}));

app.use("/api", routes);
app.use(express.static(path.join(__dirname, "public")));

// Manda todos as outras requisições para o index.html
app.get("/*", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(app.get("port"), () => {
	console.log("Server is listening at ", app.get("port"));
});
