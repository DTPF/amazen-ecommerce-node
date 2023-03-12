const Cart = require("../models/Cart");
const { cartMessage } = require("../responsesMessages/cart.messages");

function addToCart(req, res) {
  const cart = new Cart();
  const { userId, productId, price, shippingDate } = req.body;

  Cart.find({ userId: userId, productId: productId })
    .then(cartItem => {
      if (!cartItem) {
        return res.status(400).send({ status: 400, message: cartMessage.productNotFound });
      }

      Cart.findByIdAndUpdate({ _id: cartItem[0].id }, { quantity: cartItem[0].quantity + 1 })
        .then(cartStored => {
          if (!cartStored) {
            return res.status(400).send({ status: 400, message: cartMessage.productNotFound });
          }
          return res.status(200).send({ status: 200, message: cartMessage.addProductSuccess, cartItem: cartStored, quantity: cartItem[0].quantity + 1 })
        })
        .catch(err => {
          if (err) {
            return res.status(500).send({ status: 500, message: cartMessage.serverError });
          }
        })
    })
    .catch(err => {
      if (err) {
        cart.userId = userId;
        cart.productId = productId;
        cart.quantity = 1;
        cart.price = price;
        cart.shippingDate = shippingDate;
        cart.save()
          .then(cartStored => {
            if (!cartStored) {
              return res.status(400).send({ status: 400, message: cartMessage.productNotFound });
            }
            return res.status(200).send({ status: 200, message: cartMessage.addProductSuccess, cartItem: cart })
          })
          .catch(err => {
            if (err) {
              return res.status(502).send({ status: 502, message: cartMessage.serverError });
            }
          })
      }
    })
}

function getCartItemsByUserId(req, res) {
  const { userId } = req.params;

  Cart.find({ userId: userId })
    .then(cartItems => {
      if (!cartItems) {
        return res.status(400).send({ status: 400, message: cartMessage.productNotFound });
      }
      return res.status(200).send({ status: 200, cartItems: cartItems })
    })
    .catch(err => {
      if (err) {
        return res.status(502).send({ status: 502, message: cartMessage.serverError });
      }
    })
}

function deleteCartItemById(req, res) {
  const { cartId } = req.params;

  Cart.findByIdAndDelete({ _id: cartId })
    .then(cartItemDeleted => {
      if (!cartItemDeleted) {
        return res.status(400).send({ status: 400, message: cartMessage.productNotFound });
      }
      return res.status(200).send({ status: 200, message: cartMessage.deleteProductSuccess, cartItemId: cartId })
    })
    .catch(err => {
      if (err) {
        return res.status(502).send({ status: 502, message: cartMessage.serverError });
      }
    })
}

function updateCartQuantity(req, res) {
  const { cartId } = req.params;
  const { quantity } = req.body;

  if (quantity === 0) {
    Cart.findByIdAndDelete({ _id: cartId })
      .then(cartItemDeleted => {
        if (!cartItemDeleted) {
          return res.status(400).send({ status: 400, message: cartMessage.productNotFound });
        }
        return res.status(201).send({ status: 201, message: cartMessage.deleteProductSuccess, cartItemDeleted: cartItemDeleted })
      })
      .catch(err => {
        if (err) {
          return res.status(502).send({ status: 502, message: cartMessage.serverError });
        }
      })
  } else {
    Cart.findByIdAndUpdate({ _id: cartId }, { quantity: quantity })
      .then(cartStored => {
        if (!cartStored) {
          return res.status(400).send({ status: 400, message: cartMessage.productNotFound });
        }
        return res.status(200).send({ status: 200, message: cartMessage.modifyProductSuccess, cartItems: quantity })
      })
      .catch(err => {
        if (err) {
          return res.status(502).send({ status: 502, message: cartMessage.serverError });
        }
      })
  }
}

module.exports = {
  addToCart,
  getCartItemsByUserId,
  deleteCartItemById,
  updateCartQuantity
};