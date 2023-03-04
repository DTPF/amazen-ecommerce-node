const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = Schema({
  userId: String,
  productId: String,
  quantity: Number,
});

module.exports = mongoose.model("Cart", CartSchema);