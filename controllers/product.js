const fs = require("fs");
const path = require("path");
const moment = require("moment");
const Product = require("../models/Product");
const { productMessage } = require("../responsesMessages/product.messages");

function addProduct(req, res) {
  const { title, info, sizeAndPrice, stock, stars, waitShippingTime, category, discount } = req.body;
  const product = new Product();
  product.title = title;
  product.info = info;
  product.sizeAndPrice = sizeAndPrice;
  product.stock = stock;
  product.stars = stars;
  product.waitShippingTime = waitShippingTime;
  product.category = category;
  product.defaultImage = 1;
  product.discount = discount;
  product.createdAt = new Date();
  product.updatedAt = new Date();

  product.save()
    .then(productStored => {
      if (!productStored) {
        return res.status(400).send({ status: 400, message: productMessage.productNotFound });
      }
      return res.status(200).send({ status: 200, message: productMessage.addProductSuccess, product: productStored })
    })
    .catch(err => {
      if (err) {
        return res.status(500).send({ status: 500, message: productMessage.serverError });
      }
    });
}

function updateProduct(req, res) {
  const { id } = req.params;
  const productData = req.body;
  productData.updatedAt = new Date();

  Product.findByIdAndUpdate({ _id: id }, productData, { returnOriginal: false })
    .then(productUpdate => {
      if (!productUpdate) {
        return res.status(404).send({ status: 404, message: productMessage.productNotFound });
      } else {
        return res.status(200).send({ status: 200, message: 'Modificado correctamente', product: productUpdate });
      }
    })
    .catch(err => {
      if (err) {
        return res.status(500).send({ status: 500, message: productMessage.serverError });
      }
    })
}

async function getProducts(req, res) {
  Product.find()
  .sort({ updatedAt: "desc" })
  .then((products) => {
    if (!products) {
      return res.status(404).send({ status: 404, message: productMessage.productNotFound });
    } else {
      return res.status(200).send({ status: 200, products: products });
    }
  })
  .catch(err => {
    if (err) {
      return res.status(500).send({ status: 500, message: productMessage.serverError });
    }
  });
}

function getProductById(req, res) {
  const { productId } = req.params;

  Product.findById({ _id: productId })
    .then(product => {
      if (!product) {
        return res.status(404).send({ status: 404, message: productMessage.productNotFound });
      }
      return res.status(200).send({ status: 200, product: product });
    })
    .catch(err => {
      if (err) {
        return res.status(500).send({ status: 500, message: productMessage.serverError });
      }
    });
}

async function addImage(req, res) {
  const { productId } = req.params;
  const path = req.files.productImage && req.files.productImage.path;

  Product.findById({ _id: productId }, { returnOriginal: false })
    .then(async product => {
      if (!product) {
        path && fs.unlinkSync(path);
        return res.status(404).send({ status: 404, message: productMessage.productNotFound });
      }

      if (req.files.productImage) {
        let filePath = path;
        let fileSplit = filePath.split("/");
        let fileName = fileSplit[2];
        let extSplit = fileName.split(".");
        let fileExt = extSplit[1] && extSplit[1].toLowerCase();

        if (fileExt !== "png" && fileExt !== "jpg" && fileExt !== "jpeg") {
          path && fs.unlinkSync(path);
          return res.status(400).send({ status: 400, message: productMessage.extensionNotValid });
        }

        fileName && await Product.findByIdAndUpdate({ _id: productId }, { $push: { images: fileName } }, { returnOriginal: false })
          .then(product => {
            if (!product) {
              return res.status(404).send({ status: 404, message: productMessage.productNotFound });
            }
            return res.status(200).send({ status: 200, message: 'Imágen añadida', product: product });
          })
          .catch(err => {
            if (err) {
              return res.status(500).send({ status: 500, message: productMessage.serverError });
            }
          });
      }
    })
    .catch(err => {
      if (err) {
        return res.status(501).send({ status: 501, message: productMessage.serverError });
      }
    });
}

function deleteImage(req, res) {
  const { productId } = req.params;
  let { imageName } = req.body;

  Product.findByIdAndUpdate({ _id: productId }, { $pullAll: { images: [imageName] } }, { returnOriginal: false })
    .then(product => {
      if (!product) {
        return res.status(404).send({ status: 404, message: productMessage.productNotFound });
      }
      imageName && fs.unlinkSync(`uploads/products/${imageName}`)
      return res.status(200).send({ status: 200, message: 'Imágen eliminada', product: product });
    })
    .catch(err => {
      if (err) {
        return res.status(500).send({ status: 500, message: err });
      }
    })
}

function deleteProduct(req, res) {
  const { productId } = req.params;

  Product.findByIdAndDelete({ _id: productId })
    .then(productDeleted => {
      if (!productDeleted) {
        return res.status(404).send({ status: 404, message: productMessage.productNotFound });
      }

      productDeleted.images && productDeleted.images.forEach(image => {
        fs.unlinkSync(`uploads/products/${image}`)
      });

      return res.status(200).send({ status: 200, productId: productDeleted._id });
    })
    .catch(err => {
      if (err) {
        return res.status(500).send({ status: 500, message: productMessage.serverError });
      }
    })
}

async function getProductImage(req, res) {
  const { imageName } = req.params;
  const filePath = "./uploads/products/" + imageName;

  fs.exists(filePath, (exists) => {
    if (!exists) {
      return res.status(404).send({ status: 404, message: productMessage.imageNotExists });
    } else {
      return res.sendFile(path.resolve(filePath));
    }
  });
}

module.exports = {
  addProduct,
  updateProduct,
  getProducts,
  getProductById,
  addImage,
  deleteImage,
  deleteProduct,
  getProductImage
};
