const express = require("express");
const router = express.Router();
const db = require("../config/database");

router.get("/", async (req, res) => {
  console.log("request", req.query);
  const { personId, groupId, categoryId } = req.query;

  try {
    let query = "SELECT * FROM person_skill_details WHERE 1=1";
    const params = [];

    if (personId) {
      // Look up numeric ID from username (or adjust field if you're using oid)
      const [[personRow]] = await db.promise().query(
          "SELECT id FROM person WHERE username = ? LIMIT 1",
          [personId]
      );

      if (!personRow) {
        return res.status(404).json({ error: "Person not found with given username" });
      }

      query += " AND person_id = ?";
      params.push(personRow.id);
    }

    if (groupId) {
      query += " AND group_id = ?";
      params.push(groupId);
    }

    if (categoryId) {
      query += " AND category_id = ?";
      params.push(categoryId);
    }

    const [results] = await db.promise().query(query, params);

    console.log("get person skills", results);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch person skills" });
  }
});


router.post("/", async (req, res) => {
  const { personId, skillId, proficiency = 1 } = req.body;

  try {
    // Lookup the numeric person.id from username
    const [[personRow]] = await db.promise().query(
        "SELECT id FROM person WHERE username = ? LIMIT 1",
        [personId]
    );

    if (!personRow) {
      return res.status(404).json({ error: "Person not found with provided username" });
    }

    const numericPersonId = personRow.id;

    const [result] = await db.promise().query(
        "INSERT INTO person_skill (skill_id, person_id, proficiency) VALUES (?, ?, ?)",
        [skillId, numericPersonId, proficiency]
    );

    res.status(201).json({ id: result.insertId, proficiency });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add skill to person", exception: err });
  }
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
