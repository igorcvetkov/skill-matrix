const express = require("express");
const router = express.Router();
const db = require("../config/database");
const {validateToken} = require("../auth");

// Get all persons that are in the same project(s) as the current user
router.get("/", validateToken, async (req, res) => {
  const userOid = req.user?.oid;

  if (!userOid) {
    return res.status(400).json({ error: "User OID not found in token" });
  }

  try {
    // Get current user’s person and role
    const [[personRow]] = await db.promise().query(
        "SELECT id, role_id FROM person WHERE oid = ? LIMIT 1",
        [userOid]
    );

    if (!personRow) {
      return res.status(404).json({ error: "Person not found for current user" });
    }

    const personId = personRow.id;
    const roleId = personRow.role_id;

    // Admins see all persons
    if (roleId === 1) {
      const [allPersons] = await db.promise().query(
          "SELECT id, oid, name, username, role_id FROM person"
      );
      return res.json(allPersons);
    }

    // Project Managers see persons in same projects
    const [relatedRows] = await db.promise().query(
        `
          SELECT DISTINCT pm2.person_id AS person_id
          FROM project_member pm1
                 JOIN project_member pm2 ON pm1.project_id = pm2.project_id
          WHERE pm1.person_id = ? AND pm2.person_id IS NOT NULL
        `,
        [personId]
    );

    const relatedPersonIds = relatedRows.map(row => row.person_id);

    if (relatedPersonIds.length === 0) {
      return res.json([]);
    }

    const [persons] = await db.promise().query(
        "SELECT id, oid, name, username, role_id FROM person WHERE id IN (?)",
        [relatedPersonIds]
    );

    res.json(persons);
  } catch (err) {
    console.error("Error fetching persons:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all persons assigned to a specific project
router.get("/by-project/:projectId", validateToken, async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ error: "Project ID is required" });
  }

  try {
    const [rows] = await db.promise().query(
        `
      SELECT p.id, p.name, p.username, p.oid, p.role_id
      FROM project_member pm
      JOIN person p ON pm.person_id = p.id
      WHERE pm.project_id = ?
      `,
        [projectId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching project members:", err);
    res.status(500).json({ error: "Failed to retrieve project members" });
  }
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
