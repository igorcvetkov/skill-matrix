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

router.post("/", (req, res) => {
  const { name } = req.body;

  db.query("INSERT INTO skill_group (name) VALUES (?)", [name], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to add group", exception: err });
    }
    res.status(201).json({ id: result.insertId, name });
  });
});

router.put("/:id", (req, res) => {
  const groupId = req.params.id;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  db.query("UPDATE skill_group SET name = ? WHERE id = ?", [name, groupId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update group", exception: err });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    res.json({ id: parseInt(groupId), name });
  });
});

router.delete("/:id", (req, res) => {
  const groupId = req.params.id;

  db.query("DELETE FROM skill_group WHERE id = ?", [groupId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete group", exception: err });
    }
    res.status(204).send();
  });
});

module.exports = router;
