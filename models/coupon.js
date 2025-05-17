// models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  store_name: String,
  store_url: String,
  code: String,
  discount: String,
  description: String,
  verified: { type: Boolean, default: false },
  used: { type: Number, default: 0 },
});

module.exports = mongoose.model("Coupon", couponSchema);
