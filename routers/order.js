const express = require("express");
const OrderController = require("../controllers/order");
const api = express.Router();
const md_auth = require("../middlewares/authenticated");

api.post("/new-order", [md_auth.ensureAuth], OrderController.newOrder);

module.exports = api;