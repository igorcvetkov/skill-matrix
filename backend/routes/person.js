const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Person Skills endpoints
router.get("/:id/skills", (req, res) => {
  const query = `
      SELECT ps.*, s.name as skill_name 
      FROM person_skill ps
      JOIN skill s ON ps.skill_id = s.id
      WHERE ps.person_id = ?
    `;
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch person skills" });
    }
    res.json(results);
  });
});

router.post("/:id/skills", (req, res) => {
  const { skill_id, level } = req.body;
  const person_id = req.params.id;

  db.query(
    "INSERT INTO person_skill (person_id, skill_id, level) VALUES (?, ?, ?)",
    [person_id, skill_id, level],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to add skill to person" });
      }
      res.status(201).json({ id: result.insertId, person_id, skill_id, level });
    }
  );
});

module.exports = router;
