// routes/subscription.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

// Initialize Paystack subscription/payment
router.post("/initialize", async (req, res) => {
  const { email, password, plan } = req.body;

  try {
    // Map plans to amounts in KES
    const plans = {
      daily: 50,
      weekly: 300,
      biweekly: 600,
      monthly: 1000,
    };

    if (!plans[plan]) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const amount = plans[plan] * 100; // Paystack expects kobo/cents

    // Call Paystack initialize API
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount,
        callback_url: "http://localhost:3000/dashboard", // change in production
        metadata: {
          custom_fields: [
            {
              display_name: "Subscription Plan",
              variable_name: "plan",
              value: plan,
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // SECRET KEY here
          "Content-Type": "application/json",
        },
      }
    );

    // Send Paystack checkout link back to frontend
    return res.json({ authorization_url: response.data.data.authorization_url });
  } catch (err) {
    console.error("Paystack init error:", err.response?.data || err.message);
    return res
      .status(500)
      .json({ message: "Payment initialization failed" });
  }
});

module.exports = router;
