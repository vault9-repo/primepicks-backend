const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyDashboardAccess = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.subscription || new Date() > new Date(user.subscriptionEnd)) {
      return res.status(403).json({ message: "Subscription inactive" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyDashboardAccess;
