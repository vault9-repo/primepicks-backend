const cron = require("node-cron");
const User = require("../models/User");

// Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
  const now = new Date();
  const result = await User.deleteMany({ subscriptionEnd: { $lte: now } });
  console.log(`Deleted ${result.deletedCount} expired users`);
});
