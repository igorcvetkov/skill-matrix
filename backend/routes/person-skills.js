const express = require("express");
const router = express.Router();
const db = require("../config/database");
const {validateToken} = require("../auth");

router.get("/", validateToken, async (req, res) => {
  console.log("request", req.query);
  let { personId, groupId, categoryId } = req.query;

  try {
    let query = "SELECT * FROM person_skill_details WHERE 1=1";
    const params = [];

    if (personId) {
      // Special case: "me" refers to the current authenticated user
      if (personId === "me") {
        const username = req.user?.preferred_username;
        if (!username) {
          return res.status(400).json({ error: "Unable to resolve user identity for 'me'" });
        }

        const [[personRow]] = await db.promise().query(
            "SELECT id FROM person WHERE username = ? LIMIT 1",
            [username]
        );

        if (!personRow) {
          return res.status(404).json({ error: "Authenticated user not found in database" });
        }

        personId = personRow.id;
      } else if (isNaN(personId)) {
        // Treat as username
        const [[personRow]] = await db.promise().query(
            "SELECT id FROM person WHERE username = ? LIMIT 1",
            [personId]
        );

        if (!personRow) {
          return res.status(404).json({ error: "Person not found with given username" });
        }

        personId = personRow.id;
      }

      // Now personId is numeric
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

    const [results] = await db.promise().query(query, params);
    console.log("get person skills", results);
    res.json(results);
  } catch (err) {
    console.error("Failed to fetch person skills:", err);
    res.status(500).json({ error: "Failed to fetch person skills" });
  }
});

router.post("/", validateToken, async (req, res) => {
  let { personId, skillId, proficiency = 1 } = req.body;

  try {
    let numericPersonId;

    // Resolve personId
    if (personId === "me") {
      const username = req.user?.preferred_username;
      if (!username) {
        return res.status(400).json({ error: "Unable to resolve user identity for 'me'" });
      }

      const [[personRow]] = await db.promise().query(
          "SELECT id FROM person WHERE username = ? LIMIT 1",
          [username]
      );

      if (!personRow) {
        return res.status(404).json({ error: "Authenticated user not found in database" });
      }

      numericPersonId = personRow.id;

    } else if (isNaN(personId)) {
      // Assume it's a username
      const [[personRow]] = await db.promise().query(
          "SELECT id FROM person WHERE username = ? LIMIT 1",
          [personId]
      );

      if (!personRow) {
        return res.status(404).json({ error: "Person not found with provided username" });
      }

      numericPersonId = personRow.id;

    } else {
      // Already a numeric ID
      numericPersonId = parseInt(personId, 10);
    }

    // Insert skill record
    const [result] = await db.promise().query(
        "INSERT INTO person_skill (skill_id, person_id, proficiency) VALUES (?, ?, ?)",
        [skillId, numericPersonId, proficiency]
    );

    res.status(201).json({ id: result.insertId, proficiency });
  } catch (err) {
    console.error("Failed to add skill to person:", err);
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
