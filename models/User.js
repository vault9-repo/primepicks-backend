const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscription: { type: String, enum: ["daily","weekly","biweekly","monthly"], default: null },
  subscriptionEnd: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
