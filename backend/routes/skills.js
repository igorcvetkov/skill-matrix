const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Skills endpoints
router.get("/", (req, res) => {
  const { categoryId, groupId, excludeProjectId, excludePersonId } = req.query;
  let query = `
      SELECT s.*
      FROM skill_details s 
      WHERE 1=1
    `;

  const params = [];
  if (groupId) {
    query += " AND group_id = ?";
    params.push(groupId);
  }

  if (categoryId) {
    query += " AND category_id = ?";
    params.push(categoryId);
  }

  if (excludeProjectId) {
    query += " AND id not in (select skill_id from project_skill projectskill where projectskill.project_id = ?)";
    params.push(excludeProjectId);
  }

  if (excludePersonId) {
    query += " AND id not in (select skill_id from person_skill personskill where personskill.person_id = ?)";
    params.push(excludePersonId);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch skills" });
    }
    res.json(results);
  });
});

// New search route
router.get("/search", (req, res) => {
  const { query } = req.query; // Get the search query from the request

  const sqlQuery = `SELECT * FROM skill_details WHERE name LIKE '%${query}%' OR category_name LIKE '%${query}%' OR group_name LIKE '%${query}%';`;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch skills" });
    }
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { name, category_id } = req.body;
  db.query("INSERT INTO skill (name, category_id) VALUES (?, ?)", [name, category_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to create skill" });
    }
    res.status(201).json({ id: result.insertId, name, category_id });
  });
});

router.post("/bulk", async (req, res) => {
  const { skills } = req.body;

  if (!Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  try {
    const query = "INSERT INTO skill (name, category_id) VALUES ?";
    const values = skills.map((item) => [item.name, item.categoryId]); // Format for MySQL bulk insert

    const [result] = await db.promise().query(query, [values]);
    // Calculate the inserted IDs
    const insertedIds = [];
    for (let i = 0; i < result.affectedRows; i++) {
      insertedIds.push(result.insertId + i); // Calculate the IDs based on insertId
    }
    const insertedItems = await db.promise().query("SELECT * FROM skill WHERE id IN (?)", [insertedIds]);

    res.status(201).json(insertedItems[0]); // Send back the inserted items
  } catch (error) {
    console.error("Error during bulk insert:", error);
    res.status(500).json({ error: "Failed to insert items", exeption: error });
  }
});

router.delete("/:id", (req, res) => {
  const skillId = req.params.id;

  db.query("DELETE FROM skill WHERE id = ?", [skillId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete skill", exception: err });
    }
    res.status(204).send();
  });
});

// Update a skill by ID
router.put("/:id", (req, res) => {
  const skillId = req.params.id;
  const { name, category_id, description } = req.body;
  
  const updateFields = [];
  const params = [];
  
  if (name !== undefined) {
    updateFields.push("name = ?");
    params.push(name);
  }
  
  if (category_id !== undefined) {
    updateFields.push("category_id = ?");
    params.push(category_id);
  }
  
  if (description !== undefined) {
    updateFields.push("description = ?");
    params.push(description);
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }
  
  params.push(skillId); // Add skillId as the last parameter
  
  const query = `UPDATE skill SET ${updateFields.join(", ")} WHERE id = ?`;
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update skill", exception: err });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Skill not found" });
    }
    
    // Get the updated skill to return
    db.query("SELECT * FROM skill_details WHERE id = ?", [skillId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch updated skill" });
      }
      
      res.json(results[0] || { id: skillId, name, category_id, description });
    });
  });
});

module.exports = router;
