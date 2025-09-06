// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const crypto = require("crypto");

dotenv.config();

const Bet = require("./models/Bet");
const PremiumBet = require("./models/PremiumBet");
const Subscription = require("./models/Subscription");

const app = express();

// JSON for normal routes
app.use(express.json());
app.use(cors());

// ✅ MongoDB Connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// -------------------- Free Bets --------------------
app.get("/api/bets", async (req, res) => {
  try {
    const bets = await Bet.find().sort({ _id: -1 });
    res.json(bets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/add-bet", async (req, res) => {
  try {
    const bet = new Bet(req.body);
    await bet.save();
    res.json(bet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------- Premium Bets --------------------
app.get("/api/premium-bets", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Email required" });

    const sub = await Subscription.findOne({ email });
    if (!sub) return res.status(403).json({ error: "No subscription found" });

    if (sub.status !== "active") return res.status(403).json({ error: "Subscription not active" });
    if (new Date(sub.expiresAt) < new Date()) return res.status(403).json({ error: "Expired" });

    const bets = await PremiumBet.find().sort({ _id: -1 });
    res.json(bets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/add-premium-bet", async (req, res) => {
  try {
    const bet = new PremiumBet(req.body);
    await bet.save();
    res.json(bet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------- Subscription --------------------
app.post("/api/subscriptions/create", async (req, res) => {
  try {
    const { email, plan } = req.body;
    if (!email || !plan) return res.status(400).json({ error: "Missing fields" });

    const planMap = {
      daily: { amount: 49, days: 1 },
      weekly: { amount: 199, days: 7 },
      monthly: { amount: 399, days: 30 },
      jackpot: { amount: 1000, days: 30 }
    };
    const config = planMap[plan];
    if (!config) return res.status(400).json({ error: "Invalid plan" });

    const paystackSecret = process.env.PAYSTACK_SECRET;
    const callback_url = process.env.PAYSTACK_CALLBACK || process.env.FRONTEND_URL;

    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        amount: config.amount * 100,
        callback_url
      })
    });

    const data = await initRes.json();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.days);

    await Subscription.findOneAndUpdate(
      { email },
      { email, plan, status: "pending", expiresAt, createdAt: new Date() },
      { upsert: true, new: true }
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- Paystack Webhook --------------------
app.post("/api/webhook", bodyParser.raw({ type: "*/*" }), async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    const hmac = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET);
    hmac.update(req.body);
    const digest = hmac.digest("hex");

    if (signature !== digest) {
      return res.status(401).send("Invalid signature");
    }

    const payload = JSON.parse(req.body.toString());

    if (payload.event === "charge.success") {
      const email = payload.data.customer.email;
      const sub = await Subscription.findOne({ email });
      if (sub) {
        sub.status = "active";
        await sub.save();
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Webhook error");
  }
});

// -------------------- Start --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on ${PORT}`));
