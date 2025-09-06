const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // serve admin.html

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Bet schema
const betSchema = new mongoose.Schema({
  match: String,
  prediction: String,
  date: String,
  plan: { type: String, enum: ["daily", "weekly", "monthly", "jackpot"] }
});
const Bet = mongoose.model("Bet", betSchema);

// Routes
app.get("/api/bets", async (req, res) => {
  const bets = await Bet.find();
  res.json(bets);
});

app.post("/api/bets", async (req, res) => {
  try {
    const bet = new Bet(req.body);
    await bet.save();
    res.status(201).json(bet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/bets/:id", async (req, res) => {
  try {
    await Bet.findByIdAndDelete(req.params.id);
    res.json({ message: "Bet deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Admin service running on port ${PORT}`));
