// models/Admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { 
    collection: "adminCoupon", // Explicitly set the collection name
  }
);

module.exports = mongoose.model("Admin", adminSchema);
