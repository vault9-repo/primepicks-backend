const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    time: { type: String, required: true },
    match: { type: String, required: true },
    prediction: { type: String, required: true },
    odds: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prediction", predictionSchema);
