const Subscription = require("../models/Subscription");

async function checkSubscription(req, res, next) {
  const email = req.headers["x-user-email"];

  if (!email) {
    return res.status(403).json({ error: "❌ No email provided. Please subscribe." });
  }

  try {
    const sub = await Subscription.findOne({ email }).sort({ expiryDate: -1 });

    if (!sub) {
      return res.status(403).json({ error: "❌ No active subscription." });
    }

    const now = new Date();
    if (sub.expiryDate < now) {
      return res.status(403).json({ error: "❌ Subscription expired." });
    }

    req.subscription = sub; // Pass subscription info to next handler
    next();
  } catch (err) {
    console.error("Subscription check error:", err);
    res.status(500).json({ error: "❌ Server error" });
  }
}

module.exports = checkSubscription;
