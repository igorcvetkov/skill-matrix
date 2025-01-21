const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Projects endpoints
router.get("/", (req, res) => {
  db.query("SELECT * FROM project", (err, results) => {
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
      const [projectResult] = await db
        .promise()
        .query("INSERT INTO project (name, description) VALUES (?, ?)", [name, description]);
      const projectId = projectResult.insertId;

      // Insert project skills
      if (skills && skills.length) {
        await Promise.all(
          skills.map((skillId) =>
            db.promise().query("INSERT INTO project_skill (project_id, skill_id) VALUES (?, ?)", [projectId, skillId])
          )
        );
      }

      // Insert project members
      if (members && members.length) {
        await Promise.all(
          members.map((personId) =>
            db
              .promise()
              .query("INSERT INTO project_member (project_id, person_id) VALUES (?, ?)", [projectId, personId])
          )
        );
      }

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

module.exports = router;
