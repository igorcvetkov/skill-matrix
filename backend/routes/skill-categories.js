const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Skill Categories endpoints
router.get("/", (req, res) => {
  db.query("SELECT * FROM skill_category", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch skill categories" });
    }
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { name, groupId } = req.body;

  db.query("INSERT INTO skill_category (name, group_id) VALUES (?, ?)", [name, groupId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to add category", exception: err });
    }
    res.status(201).json({ id: result.insertId, name });
  });
});

module.exports = router;
