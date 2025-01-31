const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Projects endpoints
router.get("/", (req, res) => {
  const { projectId } = req.query;
  let query = "select * from project_skill_details where 1=1";
  const params = [];
  if (projectId) {
    query += " AND project_id = ?";
    params.push(projectId);
  }
  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch projects" });
    }
    console.info(results);
    res.json(results);
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
