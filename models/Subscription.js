const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  plan: { type: String, enum: ["daily","weekly","monthly","jackpot"], required: true },
  status: { type: String, enum: ["pending","active","expired"], default: "pending" },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
