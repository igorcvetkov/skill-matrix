const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Person Skills endpoints
router.get("/", (req, res) => {
  let query = "SELECT DISTINCT person_id FROM person_skill where 1=1 ";
  const params = [];

  console.log("personid", req.user);
  if (!req.user.roles.includes("admin")) {
    query += " AND person_id = ?";
    params.push(req.user.unique_name);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch projects" });
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
