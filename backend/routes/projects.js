const express = require("express");
const router = express.Router();
const db = require("../config/database");
const {validateToken} = require("../auth");

router.get("/", validateToken, (req, res) => {
  // Microsoft Entra ID puts the user’s immutable object-ID in `oid`
  // (fallback to `sub` in case you’re using a B2C token).
  const personId = req.user?.oid || req.user?.sub;

  if (!personId) {
    return res.status(400).json({ error: "User ID not found in token" });
  }

  const query = `
      SELECT DISTINCT p.*
      FROM project           AS p
      JOIN project_member    AS pm ON pm.project_id = p.id
      WHERE pm.person_id = ?;
  `;

  db.query(query, [personId], (err, results) => {
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
          skill_name: r.skill_name,
        })),
      members: [...new Set(results.filter((r) => r.person_id).map((r) => r.person_id))],
    };
    res.json(project);
  });
});

router.post("/", (req, res) => {
  const { name, description, skills, members } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Project name is required" });
  }

  const insertQuery = "INSERT INTO project (name) VALUES (?)";

  db.query(insertQuery, [name], (error, result) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to create project", exception: error });
    }

    res.status(201).json({
      id: result.insertId,
      name: name,
    });
  });
});


router.put("/:id", (req, res) => {
  const projectId = req.params.id;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Project name is required" });
  }

  db.query(
    "UPDATE project SET name = ? WHERE id = ?",
    [name, projectId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update project", exception: err });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Return the updated project
      res.json({
        id: parseInt(projectId),
        name
      });
    }
  );
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
