const express = require("express");
const router = express.Router();
const db = require("../config/database");
const {validateToken} = require("../auth");

// Get all persons that are in the same project(s) as the current user
router.get("/", validateToken, (req, res) => {
  const personId = req.user?.oid || req.user?.sub;

  if (!personId) {
    return res.status(400).json({ error: "User ID not found in token" });
  }

  const query = `
    SELECT DISTINCT pm2.person_id
    FROM project_member pm1
    JOIN project_member pm2 ON pm1.project_id = pm2.project_id
    WHERE pm1.person_id = ?
  `;

  db.query(query, [personId], (err, results) => {
    if (err) {
      console.error("Error fetching related persons:", err);
      return res.status(500).json({ error: "Failed to fetch persons" });
    }

    if (results.length === 0) {
      // Return mock data only in development
      if (process.env.NODE_ENV === 'development') {
        return res.json([
          { person_id: "mock-user-1", name: "John Doe" },
          { person_id: "mock-user-2", name: "Jane Smith" },
          { person_id: "mock-admin-1", name: "Admin User" }
        ]);
      }
      return res.json([]);
    }

    const persons = results.map(result => ({
      person_id: result.person_id,
      name: result.person_id // Frontend expects name = person_id
    }));

    res.json(persons);
  });
});

// Add a skill to a person
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
