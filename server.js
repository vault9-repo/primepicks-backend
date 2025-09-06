const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("✅ PrimePicks backend is running");
});

// Example bets route
const bets = [];
app.get("/api/bets", (req, res) => {
  res.json(bets);
});

app.post("/api/add-bet", (req, res) => {
  const bet = { id: bets.length + 1, ...req.body };
  bets.push(bet);
  res.json(bet);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
