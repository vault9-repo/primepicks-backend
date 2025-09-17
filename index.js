const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, {
    dbName: "primepicks", // 👈 force DB name
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📂 Using database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // exit if DB fails to connect
  });

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/subscription", require("./routes/subscription"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/dashboard/predictions", require("./routes/predictions"));

// Start cron job
require("./cron/subscriptionCheck");

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
