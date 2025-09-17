const express = require("express");
const router = express.Router();
const verifyDashboardAccess = require("../middleware/auth");
const Prediction = require("../models/Prediction");

router.get("/", verifyDashboardAccess, async (req, res) => {
  try {
    const predictions = await Prediction.find().sort({ createdAt: -1 });
    res.json({ success: true, predictions });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
