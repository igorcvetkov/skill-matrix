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
  if (groupId) {
    query += " AND group_id = ?";
    params.push(groupId);
  }
  if (categoryId) {
    query += " AND category_id = ?";
    params.push(categoryId);
  }

  console.debug("load project skills");
  console.debug(query);
  console.debug(params);

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch projects" });
    }
    console.debug("results");
    console.debug(results);
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { projectId, skillId } = req.body;

  db.query("INSERT INTO project_skill (skill_id, project_id) VALUES (?, ?)", [skillId, projectId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to add skill to project", exception: err });
    }
    res.status(201).json({ id: result.insertId });
  });
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
