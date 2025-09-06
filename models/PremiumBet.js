const mongoose = require("mongoose");

const premiumBetSchema = new mongoose.Schema({
  match: String,
  prediction: String,
  date: String
});

module.exports = mongoose.model("PremiumBet", premiumBetSchema);
