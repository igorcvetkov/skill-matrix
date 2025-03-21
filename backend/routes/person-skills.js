const express = require("express");
const router = express.Router();
const db = require("../config/database");

router.get("/", (req, res) => {
  console.log("request", req.query);
  const { personId, groupId, categoryId } = req.query;
  let query = "select * from person_skill_details where 1=1";
  const params = [];
  if (personId) {
    // if (req.user.roles.includes("admin")) {
    //   query += " AND person_id = ?";
    //   params.push(personId);
    // } else {
    query += " AND person_id = ?";
    params.push(personId);
    // }
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
  const { personId, skillId, proficiency = 1 } = req.body;

  db.query("INSERT INTO person_skill (skill_id, person_id, proficiency) VALUES (?, ?, ?)", 
    [skillId, personId, proficiency], 
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to add skill to person", exception: err });
      }
      res.status(201).json({ id: result.insertId, proficiency });
    }
  );
});

// Update an existing person-skill record
router.put("/:id", (req, res) => {
  const skillId = req.params.id;
  const { proficiency } = req.body;

  db.query("UPDATE person_skill SET proficiency = ? WHERE id = ?", 
    [proficiency, skillId], 
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update person skill", exception: err });
      }
      res.status(200).json({ id: skillId, proficiency });
    }
  );
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
