// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch"); // for Paystack requests
const bodyParser = require("body-parser");
const crypto = require("crypto");
const path = require("path");

// Load .env file
dotenv.config();

// Models
const Bet = require("./models/Bet");
const PremiumBet = require("./models/PremiumBet");
const Subscription = require("./models/Subscription");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Optional: serve frontend if hosted together
// app.use(express.static(path.join(__dirname, "../frontend")));

// ------------------ MongoDB Connection ------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ------------------ Free Bets ------------------

// Public: get all free bets
app.get("/api/bets", async (req, res) => {
  try {
    const bets = await Bet.find().sort({ createdAt: -1 });
    res.json(bets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: add free bet
app.post("/api/add-bet", async (req, res) => {
  try {
    const { match, prediction, date } = req.body;
    if (!match || !prediction || !date) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const bet = new Bet({ match, prediction, date });
    await bet.save();
    res.json(bet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: delete free bet
app.delete("/api/delete-bet/:id", async (req, res) => {
  try {
    await Bet.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------ Premium Bets ------------------

// Protected: only for active subscribers
app.get("/api/premium-bets", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Email required" });

    const sub = await Subscription.findOne({ email });
    if (!sub) return res.status(403).json({ error: "No subscription found" });

    // Check subscription status & expiry
    if (sub.status !== "active") {
      return res.status(403).json({ error: "Subscription not active" });
    }
    if (new Date(sub.expiresAt) < new Date()) {
      sub.status = "expired";
      await sub.save();
      return res.status(403).json({ error: "Subscription expired" });
    }

    const bets = await PremiumBet.find().sort({ createdAt: -1 });
    res.json(bets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: add premium bet
app.post("/api/add-premium-bet", async (req, res) => {
  try {
    const { match, prediction, date } = req.body;
    if (!match || !prediction || !date) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const bet = new PremiumBet({ match, prediction, date });
    await bet.save();
    res.json(bet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------ Subscription (Paystack Init) ------------------
app.post("/api/subscriptions/create", async (req, res) => {
  try {
    const { email, plan } = req.body;
    if (!email || !plan) {
      return res.status(400).json({ error: "Missing email or plan" });
    }

    const planMap = {
      daily: { amount: 49, days: 1 },
      weekly: { amount: 199, days: 7 },
      monthly: { amount: 399, days: 30 },
      jackpot: { amount: 1000, days: 30 },
    };
    const config = planMap[plan];
    if (!config) return res.status(400).json({ error: "Invalid plan" });

    const paystackSecret = process.env.PAYSTACK_SECRET;
    if (!paystackSecret) {
      return res.status(500).json({ error: "PAYSTACK_SECRET not configured" });
    }

    // Call Paystack API
    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: config.amount * 100,
        callback_url: process.env.PAYSTACK_CALLBACK || process.env.FRONTEND_URL,
      }),
    });

    const data = await initRes.json();
    if (!data.status) {
      return res.status(500).json({ error: "Paystack init failed", details: data });
    }

    // Save subscription as pending
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.days);

    await Subscription.findOneAndUpdate(
      { email },
      {
        email,
        plan,
        status: "pending",
        expiresAt,
        paystackReference: data.data.reference,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json(data); // contains Paystack authorization_url
  } catch (err) {
    console.error("Create subscription error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------ Paystack Webhook ------------------
app.post("/api/webhook", bodyParser.raw({ type: "*/*" }), async (req, res) => {
  try {
    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;
    const signature = req.headers["x-paystack-signature"];

    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(req.body).digest("hex");
    if (signature !== hash) {
      console.warn("Invalid Paystack signature");
      return res.status(401).send("Invalid signature");
    }

    const payload = JSON.parse(req.body.toString());

    if (payload.event === "charge.success" && payload.data.status === "success") {
      const email = payload.data.customer.email;
      const reference = payload.data.reference;

      const sub = await Subscription.findOne({ email });
      if (sub) {
        sub.status = "active";
        sub.paystackReference = reference;
        await sub.save();
        console.log(`✅ Subscription activated for ${email}`);
      } else {
        console.log("⚠️ No subscription record for email:", email);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Webhook error");
  }
});

// ------------------ Health Check ------------------
app.get("/", (req, res) => {
  res.send("PrimePicks backend is running ✅");
});

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
