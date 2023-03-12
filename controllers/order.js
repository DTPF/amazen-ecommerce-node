const Order = require("../models/Order");
const Cart = require("../models/Cart");
const moment = require("moment");

async function newOrder(req, res) {
  const cart = new Order();
  const { userId, products, creditCardNumber } = req.body;

  if (!creditCardNumber) {
    return res.status(404).send({ status: 404, message: 'Introduce la tarjeta de crédito' });
  }

  cart.userId = userId;
  cart.products = products;
  cart.creditCardNumber = creditCardNumber;
  cart.status = 'in progress';
  cart.createdAt = new Date();
  cart.updatedAt = new Date();
  
  let totalAmount = 0;
  let shippingDate = 0;
  products.forEach(product => {
    totalAmount += (product.price * product.quantity);
    if (product.shippingDate > shippingDate) {
      shippingDate = product.shippingDate;
    }
  });

  cart.totalAmount = totalAmount;
  cart.shippingDate = moment().add(shippingDate, 'days');

  cart.save()
    .then(order => {
      if (!order) {
        return res.status(404).send({ status: 404, message: 'No se ha podido realizar el pedido' });
      } else {
        products.forEach(product => {
          Cart.findByIdAndDelete(product._id);
        })
        return res.status(200).send({ status: 200, message: 'Pedido realizado correctamente', order: order });
      }
    })
    .catch(err => {
      if (err) {
        return res.status(500).send({ status: 500, message: 'Error del servidor' });
      }
    })
}

module.exports = {
  newOrder,
};