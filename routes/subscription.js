const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Verify Paystack payment and store user
router.post("/verify-payment", async (req, res) => {
  try {
    const { reference, email, password, plan } = req.body;

    if (!reference || !email || !password || !plan)
      return res.status(400).json({ message: "Missing required fields" });

    console.log("Verify payment request:", { reference, email, plan });

    // Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    console.log("Paystack response:", response.data);

    const { status, currency } = response.data.data;
    if (status !== "success") return res.status(400).json({ message: "Payment not successful" });
    if (currency !== "KES") return res.status(400).json({ message: "Invalid currency" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const subscriptionEnd = new Date();
    switch (plan) {
      case "daily": subscriptionEnd.setDate(subscriptionEnd.getDate() + 1); break;
      case "weekly": subscriptionEnd.setDate(subscriptionEnd.getDate() + 7); break;
      case "biweekly": subscriptionEnd.setDate(subscriptionEnd.getDate() + 14); break;
      case "monthly": subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); break;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.subscriptionEnd = subscriptionEnd;
      await existingUser.save();
      return res.json({ message: "Subscription updated successfully" });
    }

    const user = new User({ email, password: hashedPassword, subscriptionEnd });
    await user.save();
    console.log("New user saved:", user.email);

    res.json({ message: "User subscribed successfully" });
  } catch (err) {
    console.error("Payment verification error:", err.response?.data || err.message);
    res.status(500).json({ message: "Server error verifying payment" });
  }
});

module.exports = router;
