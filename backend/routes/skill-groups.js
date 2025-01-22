const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Skill Categories endpoints
router.get("/", (req, res) => {
  db.query("SELECT * FROM skill_group", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch skill categories" });
    }
    res.json(results);
  });
});
module.exports = router;
