const express = require("express");
const router = express.Router();
const db = require("../config/database");

router.get("/", (req, res) => {
  const { projectId, groupId, categoryId } = req.query;
  let query = "select * from project_skill_details where 1=1";
  const params = [];
  if (projectId) {
    query += " AND project_id = ?";
    params.push(projectId);
  }
  if (groupId && groupId != null) {
    query += " AND group_id = ?";
    params.push(groupId);
  }
  if (categoryId && categoryId != null) {
    query += " AND category_id = ?";
    params.push(categoryId);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch projects" });
    }

    res.json(results);
  });
});

router.get("/:id/group-summary", (req, res) => {
  const projectId = req.params.id;

  const query =
    "select count(id), group_id, group_name from project_skill_details ps where project_id = ? group by ps.group_id";

  db.query(query, [projectId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to get project skill group summary", exception: err });
    }

    res.status(200).json(result);
  });
});

router.post("/", (req, res) => {
  const { projectId, skillId, proficiency } = req.body;

  db.query(
    "INSERT INTO project_skill (skill_id, project_id, proficiency) VALUES (?, ?, ?)", 
    [skillId, projectId, proficiency || 1], 
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to add skill to project", exception: err });
      }
      res.status(201).json({ id: result.insertId });
    }
  );
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { proficiency } = req.body;

  db.query(
    "UPDATE project_skill SET proficiency = ? WHERE id = ?",
    [proficiency, id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update project skill", exception: err });
      }
      res.status(200).json({ message: "Project skill updated successfully" });
    }
  );
});

router.delete("/:id", (req, res) => {
  const skillId = req.params.id;

  db.query("DELETE FROM project_skill WHERE id = ?", [skillId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete project", exception: err });
    }
    res.status(204).send();
  });
});

module.exports = router;
