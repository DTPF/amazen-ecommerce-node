const express = require("express");
const CartController = require("../controllers/cart");
const api = express.Router();
const md_auth = require("../middlewares/authenticated");

api.post("/add-to-cart", [md_auth.ensureAuth], CartController.addToCart);
api.get("/get-cart-items-by-user-id/:userId", [md_auth.ensureAuth], CartController.getCartItemsByUserId);
api.delete("/delete-cart-item-by-id/:cartId", [md_auth.ensureAuth], CartController.deleteCartItemById);
api.put("/update-cart-item-quantity/:cartId", [md_auth.ensureAuth], CartController.updateCartQuantity);

module.exports = api;