const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  match: { type: String, required: true },
  prediction: { type: String, required: true },
  date: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Bet", betSchema);
