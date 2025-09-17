const express = require("express");
const router = express.Router();
const verifyDashboardAccess = require("../middleware/auth");

router.get("/data", verifyDashboardAccess, async (req, res) => {
  res.json({
    message: "Welcome to your secure dashboard",
    user: req.user.username,
    email: req.user.email,
    subscriptionEnd: req.user.subscriptionEnd
  });
});

module.exports = router;
