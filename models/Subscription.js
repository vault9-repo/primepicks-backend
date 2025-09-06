const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  plan: { type: String, enum: ["daily", "weekly", "monthly", "jackpot"], required: true },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ["active", "expired"], default: "active" }
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
