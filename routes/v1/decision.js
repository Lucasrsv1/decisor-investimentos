const decisionRoutes = require("express").Router();

const decision = require("../../controllers/decision");

decisionRoutes.get("/:date/:investment/:riskAversion/:greed", decision.validations, decision.getDecision);

module.exports = decisionRoutes;
