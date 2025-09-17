const express = require("express");
const Prediction = require("../models/Prediction");
const subscriptionMiddleware = require("../middleware/subscriptionMiddleware");

const router = express.Router();

// Protect predictions with subscription check
router.get("/", subscriptionMiddleware, async (req, res) => {
  try {
    const predictions = await Prediction.find().sort({ createdAt: -1 });
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching predictions" });
  }
});

module.exports = router;
