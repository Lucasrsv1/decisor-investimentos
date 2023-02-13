const { body } = require("express-validator");
const { sha512 } = require("js-sha512");
const { sign, verify } = require("jsonwebtoken");

const { isRequestInvalid } = require("../utils/http-validation");

const KEY_TOKEN = "l&iY5deRcvh4Hz0frA0^F!zyPACD3H8m";
const EXPIRATION_TIME = 24 * 60 * 60;

const USER = Object.freeze({
	email: "lucasrsv1@gmail.com",
	password: "cb7fb426a378b1a12eb3dd1734bc4a4265f6c5b3b1ddc6aff56dee59e964ed2717387a648eac0d10e8066145e99e8cbedc12b32a3dbf4eca7b488ebd6840afae"
});

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function ensureAuthorized (req, res, next) {
	const token = req.headers["x-access-token"];
	if (!token) {
		res.status(403).json({ message: "Acesso não autorizado. A sessão do usuário é inválida." });
		return res.end();
	}

	verify(token, KEY_TOKEN, (error, _) => {
		if (error) {
			res.status(403).json({
				message: "Acesso não autorizado. A sessão do usuário é inválida.",
				expired: error.name === "TokenExpiredError",
				error
			});
			return res.end();
		}

		next(null);
	});
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
async function login (req, res) {
	if (isRequestInvalid(req, res)) return;

	try {
		// Faz o hash da senha antes de fazer o login
		const password = sha512(req.body.password);

		const validCredentials = USER.email === req.body.email && USER.password === password;
		if (!validCredentials)
			return res.status(403).json({ message: "E-mail ou senha incorretos." });

		const token = sign({ validCredentials }, KEY_TOKEN, { expiresIn: EXPIRATION_TIME });
		res.status(200).json({ token });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erro ao fazer login.", error });
	}
}

login.validations = [
	body("email").isEmail().withMessage("E-mail inválido.").normalizeEmail(),
	body("password").isString().withMessage("Senha inválida.")
];

module.exports = {
	ensureAuthorized,
	login
};
