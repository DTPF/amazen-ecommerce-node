const express = require("express");
const multipart = require("connect-multiparty");
const ProductController = require("../controllers/product");
const api = express.Router();
const md_auth = require("../middlewares/authenticated");
const md_upload_productImages = multipart({ uploadDir: "./uploads/products"});

api.post("/add-product", [md_auth.ensureAdminAuth], ProductController.addProduct);
api.put("/update-product/:id", [md_auth.ensureAdminAuth], ProductController.updateProduct);
api.get("/get-products/:category", ProductController.getProducts);
api.get("/get-product-by-id/:productId", ProductController.getProductById);
api.put("/add-image/:productId", [md_auth.ensureAdminAuth, md_upload_productImages], ProductController.addImage);
api.delete("/delete-product-image/:productId", [md_auth.ensureAdminAuth], ProductController.deleteImage);
api.delete("/delete-product/:productId", [md_auth.ensureAdminAuth], ProductController.deleteProduct);
api.get("/get-product-image/:imageName", ProductController.getProductImage);

module.exports = api;