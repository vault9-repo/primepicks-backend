const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to check if user has valid token & active subscription
async function subscriptionMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check subscription
    if (!user.subscription || !user.subscription.active) {
      return res.status(403).json({ message: "Subscription required" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("Subscription check failed:", err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = subscriptionMiddleware;
