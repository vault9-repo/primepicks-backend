// models/Pending.js
const mongoose = require("mongoose");

const pendingSchema = new mongoose.Schema({
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  plan: { type: String, enum: ["daily", "weekly", "biweekly", "monthly"], required: true },
  reference: { type: String, required: true, unique: true },
  amount: { type: Number, required: true }, // amount in kobo
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Pending", pendingSchema);
