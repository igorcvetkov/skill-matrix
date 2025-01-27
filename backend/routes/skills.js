const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Skills endpoints
router.get("/", (req, res) => {
  const query = `
      SELECT s.*, sc.name as category_name 
      FROM skill s 
      LEFT JOIN skill_category sc ON s.category_id = sc.id
    `;
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch skills" });
    }
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { name, category_id } = req.body;
  db.query("INSERT INTO skill (name, category_id) VALUES (?, ?)", [name, category_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to create skill" });
    }
    res.status(201).json({ id: result.insertId, name, category_id });
  });
});

router.delete("/:id", (req, res) => {
  const skillId = req.params.id;

  db.query("DELETE FROM skill WHERE id = ?", [skillId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete skill", exception: err });
    }
    res.status(204).send();
  });
});

module.exports = router;
