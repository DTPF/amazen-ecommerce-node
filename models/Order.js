const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = Schema({
  userId: String,
  products: {},
  creditCardNumber: {
    creditNumber: Number,
    creditCCV: Number,
    creditExpires: String
  },
  totalAmount: Number,  
  status: String,
  shippingDate: Date,
  discount: {},
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model("Order", OrderSchema);