const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { initializePayment } = require("../utils/paystack");

// Packages in KES
const packages = {
  daily: 50,
  weekly: 300,
  biweekly: 600,
  monthly: 1000,
};

router.post("/subscribe", async (req, res) => {
  const { email, password, plan } = req.body;
  if (!packages[plan]) return res.status(400).json({ message: "Invalid plan" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const subscriptionEnd = new Date();

  switch (plan) {
    case "daily": subscriptionEnd.setDate(subscriptionEnd.getDate() + 1); break;
    case "weekly": subscriptionEnd.setDate(subscriptionEnd.getDate() + 7); break;
    case "biweekly": subscriptionEnd.setDate(subscriptionEnd.getDate() + 14); break;
    case "monthly": subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); break;
  }

  const user = new User({ email, password: hashedPassword, subscriptionEnd });
  await user.save();

  const reference = `SUB_${Date.now()}`;
  const payment = await initializePayment(email, packages[plan] * 100, reference);

  res.json({ payment_url: payment.data.authorization_url });
});

module.exports = router;
