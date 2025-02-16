const express = require("express");
const router = express.Router();
const db = require("../config/database");

router.get("/", (req, res) => {
  console.log("request", req);
  const { personId, groupId, categoryId } = req.query;
  let query = "select * from person_skill_details where 1=1";
  const params = [];
  if (personId) {
    query += " AND person_id = ?";
    params.push(personId);
  }
  if (groupId) {
    query += " AND group_id = ?";
    params.push(groupId);
  }
  if (categoryId) {
    query += " AND category_id = ?";
    params.push(categoryId);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch person skills" });
    }
    console.log("get person skills", results);
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { personId, skillId } = req.body;

  db.query("INSERT INTO person_skill (skill_id, person_id) VALUES (?, ?)", [skillId, personId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to add skill to person", exception: err });
    }
    res.status(201).json({ id: result.insertId });
  });
});

router.delete("/:id", (req, res) => {
  const skillId = req.params.id;

  db.query("DELETE FROM person_skill WHERE id = ?", [skillId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete person", exception: err });
    }
    res.status(204).send();
  });
});

module.exports = router;
