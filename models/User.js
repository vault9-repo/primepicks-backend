const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String }, // optional if only using Paystack for auth
    subscription: {
      active: { type: Boolean, default: false },
      plan: { type: String, default: null }, // daily, weekly, monthly
      expiresAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
