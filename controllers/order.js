const Order = require("../models/Order");
const Cart = require("../models/Cart");
const moment = require("moment");

async function newOrder(req, res) {
  const cart = new Order();
  const { userId, products, creditCardNumber, discount } = req.body;

  if (!creditCardNumber) {
    return res.status(404).send({ status: 404, message: 'Introduce la tarjeta de crédito' });
  }

  let totalAmount = 0;
  let shippingInDays = 0;
  
  products.forEach(product => {
    totalAmount += (product.price * product.quantity);
    if (product.shippingDate > shippingInDays) {
      shippingInDays = product.shippingDate;
    }
  });
  
  cart.userId = userId;
  cart.products = products;
  cart.creditCardNumber = creditCardNumber;
  cart.status = 'in progress';
  cart.createdAt = new Date();
  cart.updatedAt = new Date();
  cart.discount = discount;
  cart.totalAmount = totalAmount;
  cart.discount = discount;
  cart.shippingDate = moment().add(shippingInDays, 'days');

  if (discount) {
    cart.totalAmount = (totalAmount - totalAmount * (discount.percent / 100));
  }

  cart.save()
    .then(order => {
      if (!order) {
        return res.status(404).send({ status: 404, message: 'No se ha podido realizar el pedido' });
      } else {
        products.forEach(cart => {
          Cart.findByIdAndDelete(cart._id)
            .then(res => {
              res.status(200);
            });
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