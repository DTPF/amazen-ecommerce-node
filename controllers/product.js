const fs = require("fs");
const path = require("path");
const moment = require("moment");
const Product = require("../models/Product");
const { productMessage } = require("../responsesMessages/product.messages");

function addProduct(req, res) {
  const { title, info, sizeAndPrice } = req.body;
  const product = new Product();
  product.title = title;
  product.info = info;
  product.sizeAndPrice = sizeAndPrice;
  product.stock = 100;
  product.stars = 0;
  product.shippingDate = moment().add(1, 'days');;
  product.createdAt = Date.now();
  product.updatedAt = Date.now();

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

function getProducts(req, res) {
  Product.find()
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

function addImage(req, res) {
  const { productId } = req.params;
  const path = req.files.productImage && req.files.productImage.path;

  Product.findById({ _id: productId })
    .then(product => {
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

        fileName && Product.findByIdAndUpdate({ _id: productId }, { $push: { images: fileName } })
          .then(product => {
            if (!product) {
              return res.status(404).send({ status: 404, message: productMessage.productNotFound });
            }
            return res.status(200).send({ status: 200, productId: product._id, imagePath: fileName });
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

  Product.findByIdAndUpdate({ _id: productId }, { $pullAll: { images: [imageName] } })
    .then(product => {
      if (!product) {
        return res.status(404).send({ status: 404, message: productMessage.productNotFound });
      }
      imageName && fs.unlinkSync(`uploads/products/${imageName}`)
      return res.status(200).send({ status: 200, product: product._id });
    })
    .catch(err => {
      if (err) {
        return res.status(500).send({ status: 500, message: productMessage.serverError });
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
  getProducts,
  getProductById,
  addImage,
  deleteImage,
  deleteProduct,
  getProductImage
};
