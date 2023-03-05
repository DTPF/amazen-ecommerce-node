const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = Schema({
  title: { type: String, required: true },
  info: {
    brand: String,
    color: String
  },
  sizeAndPrice: [{
    size: String,
    price: Number 
  }],
  stock: Number,
  stars: Number,
  images: [String],
  shippingDate: Date,
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model("Product", ProductSchema);