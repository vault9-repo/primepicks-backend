const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.resolve(__dirname, "primepicks.db"), (err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

// Create table if it doesn’t exist
db.run(`
  CREATE TABLE IF NOT EXISTS bets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match TEXT NOT NULL,
    prediction TEXT NOT NULL,
    date TEXT NOT NULL
  )
`);

module.exports = db;
