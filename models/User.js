const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema({
  name: { type: String, required: true },
  lastname: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: String,
  avatar: String,
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model("User", UserSchema);