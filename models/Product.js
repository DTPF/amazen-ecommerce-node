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
  defaultImage: Number,
  waitShippingTime: Number,
  category: String,
  discount: {
    shop: String,
    percent: Number,
    discountName: String
  },
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model("Product", ProductSchema);