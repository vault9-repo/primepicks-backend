const cron = require("node-cron");
const User = require("../models/User");

// Runs every hour to expire subscriptions
cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    await User.updateMany(
      { subscriptionEnd: { $lte: now } },
      { $set: { subscription: null, subscriptionEnd: null } }
    );
    console.log("Expired subscriptions cleared");
  } catch (err) {
    console.error("Error clearing subscriptions:", err);
  }
});
