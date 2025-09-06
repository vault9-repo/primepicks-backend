const express = require("express");
const PremiumBet = require("../models/PremiumBet");
const checkSubscription = require("../middleware/checkSubscription");

const router = express.Router();

// ➕ Add Bet (Admin only for now)
router.post("/add", async (req, res) => {
  try {
    const { match, prediction, date } = req.body;
    const bet = new PremiumBet({ match, prediction, date });
    await bet.save();
    res.json(bet);
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to add bet" });
  }
});

// 📊 Get Bets (requires subscription)
router.get("/", checkSubscription, async (req, res) => {
  try {
    const bets = await PremiumBet.find().sort({ createdAt: -1 });
    res.json(bets);
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to fetch bets" });
  }
});

// ❌ Delete Bet (Admin only)
router.delete("/delete/:id", async (req, res) => {
  try {
    await PremiumBet.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Bet deleted" });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to delete bet" });
  }
});

module.exports = router;
