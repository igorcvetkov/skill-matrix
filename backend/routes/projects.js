const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Projects endpoints
router.get("/", (req, res) => {
  const query = "SELECT * FROM project";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch projects" });
    }
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const projectId = req.params.id;
  const query = `
      SELECT p.*, 
             ps.skill_id,
             s.name as skill_name,
             pm.person_id
      FROM project p
      LEFT JOIN project_skill ps ON p.id = ps.project_id
      LEFT JOIN skill s ON ps.skill_id = s.id
      LEFT JOIN project_member pm ON p.id = pm.project_id
      WHERE p.id = ?
    `;
  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch project" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Format the response
    const project = {
      id: results[0].id,
      name: results[0].name,
      skills: results
        .filter((r) => r.skill_id)
        .map((r) => ({
          id: r.skill_id,
          name: r.skill_name,
        })),
      members: [...new Set(results.filter((r) => r.person_id).map((r) => r.person_id))],
    };
    res.json(project);
  });
});

router.post("/", (req, res) => {
  const { name, description, skills, members } = req.body;

  db.beginTransaction(async (err) => {
    if (err) throw err;

    try {
      // Insert project
      const insertQuery = "INSERT INTO project (name) VALUES (?)"; // Use $1 for PostgreSQL
      const [projectResult] = await db.promise().query(insertQuery, [name]);
      const projectId = projectResult.insertId || projectResult[0].id; // Handle both MySQL and PostgreSQL

      await db.promise().commit();
      res.status(201).json({
        id: projectId,
        name,
        description,
        skills,
        members,
      });
    } catch (error) {
      await db.promise().rollback();
      console.error(error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });
});

router.delete("/:id", (req, res) => {
  const categoryId = req.params.id;

  db.query("DELETE FROM project WHERE id = ?", [categoryId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete project", exception: err });
    }
    res.status(204).send();
  });
});

module.exports = router;
