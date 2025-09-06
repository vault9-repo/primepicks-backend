// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/primepicks";
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Models
const BetSchema = new mongoose.Schema({
  match: String,
  prediction: String,
  date: String,
});
const Bet = mongoose.model("Bet", BetSchema);

const SubscriptionSchema = new mongoose.Schema({
  email: String,
  plan: String,
  reference: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});
const Subscription = mongoose.model("Subscription", SubscriptionSchema);

// Routes
app.get("/", (req, res) => {
  res.send("PrimePicks Admin API running ✅");
});

// ---------------- BETS ----------------
app.get("/api/bets", async (req, res) => {
  try {
    const bets = await Bet.find().sort({ date: -1 });
    res.json(bets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bets" });
  }
});

app.post("/api/bets", async (req, res) => {
  try {
    const bet = new Bet(req.body);
    await bet.save();
    res.json({ success: true, bet });
  } catch (err) {
    res.status(400).json({ error: "Failed to add bet" });
  }
});

app.delete("/api/bets/:id", async (req, res) => {
  try {
    await Bet.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete bet" });
  }
});

// ---------------- SUBSCRIPTIONS ----------------
app.post("/api/subscriptions/verify", async (req, res) => {
  const { reference, plan, email } = req.body;
  try {
    // Store subscription (you can extend with Paystack verification call)
    const sub = new Subscription({ email, plan, reference, status: "active" });
    await sub.save();
    res.json({ success: true, subscription: sub });
  } catch (err) {
    res.status(400).json({ error: "Failed to verify subscription" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
