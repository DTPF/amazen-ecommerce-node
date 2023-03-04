const express = require("express");
const CartController = require("../controllers/cart");

const api = express.Router();

api.post("/add-to-cart", CartController.addToCart);
api.get("/get-cart-items-by-user-id/:id", CartController.getCartItemsByUserId);

module.exports = api;