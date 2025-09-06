// backend/models/PremiumBet.js
const mongoose = require("mongoose");

const premiumBetSchema = new mongoose.Schema({
  match: { type: String, required: true },
  prediction: { type: String, required: true },
  date: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("PremiumBet", premiumBetSchema);
