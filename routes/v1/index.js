const v1 = require("express").Router();

const generalRoutes = require("./general");
const decisionRoutes = require("./decision");

v1.use("/", generalRoutes);
v1.use("/decision", decisionRoutes);

module.exports = v1;
