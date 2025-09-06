const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config();

const Subscription = require("./models/Subscription");
const PremiumBet = require("./models/PremiumBet");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

// ✅ Connect DB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));

// ✅ Paystack config (test key for now)
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET || "sk_test_xxxxxxxxxxxxxxxx";

// ➕ Add premium bet (admin only via Postman/Render dashboard)
app.post("/api/add-premium-bet", async (req, res) => {
  try {
    const bet = new PremiumBet(req.body);
    await bet.save();
    res.json(bet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Get premium bets (only if subscription active)
app.get("/api/premium-bets", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  const sub = await Subscription.findOne({ email, status: "active" });
  if (!sub || sub.expiryDate < new Date()) {
    return res.status(403).json({ error: "Subscription expired or not found" });
  }

  const bets = await PremiumBet.find();
  res.json(bets);
});

// 💳 Create Paystack subscription
app.post("/api/subscriptions/create", async (req, res) => {
  const { email, plan } = req.body;
  if (!email || !plan) return res.status(400).json({ error: "Email and plan required" });

  // plan durations
  const durations = { daily: 1, weekly: 7, monthly: 30, jackpot: 30 };
  const days = durations[plan] || 1;

  // call Paystack initialize
  try {
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        amount: plan === "daily" ? 4900 : plan === "weekly" ? 19900 : plan === "monthly" ? 39900 : 100000, // in kobo
        callback_url: "https://primepicks-frontend.onrender.com" // redirect here after payment
      })
    });

    const data = await paystackRes.json();

    // save subscription (pending until payment success)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const sub = new Subscription({ email, plan, expiryDate, status: "active" });
    await sub.save();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
