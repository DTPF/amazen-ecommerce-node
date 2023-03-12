const express = require("express");
const path = require('path');
const bodyParser = require("body-parser");
const app = express();
const { API_VERSION } = require("./config");
const authRoutes = require("./routers/auth");
const userRoutes = require("./routers/user");
const cartRoutes = require("./routers/cart");
const productRoutes = require("./routers/product");
const orderRoutes = require("./routers/order");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

// Router
app.use(`/api/${API_VERSION}`, authRoutes);
app.use(`/api/${API_VERSION}`, userRoutes);
app.use(`/api/${API_VERSION}`, cartRoutes);
app.use(`/api/${API_VERSION}`, productRoutes);
app.use(`/api/${API_VERSION}`, orderRoutes);
// app.use('/', express.static('client', {redirect: false}));
// app.get('*', function(req, res, next){
//   res.sendFile(path.resolve('client/index.html'));
// });

module.exports = app;