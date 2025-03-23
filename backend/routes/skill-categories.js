const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Skill Categories endpoints
router.get("/", (req, res) => {
  const { groupId } = req.query;
  let query = "SELECT * FROM skill_category_details where 1=1";
  const params = [];
  if (groupId) {
    query += " AND group_id = ?";
    params.push(groupId);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch skill categories" });
    }
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { name, groupId } = req.body;

  db.query("INSERT INTO skill_category (name, group_id) VALUES (?, ?)", [name, groupId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to add category", exception: err });
    }
    res.status(201).json({ id: result.insertId, name });
  });
});

router.post("/bulk", async (req, res) => {
  const { categories } = req.body;

  if (!Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  try {
    const query = "INSERT INTO skill_category (name, group_id) VALUES ?";
    const values = categories.map((item) => [item.name, item.groupId]); // Format for MySQL bulk insert

    const [result] = await db.promise().query(query, [values]);
    // Calculate the inserted IDs
    const insertedIds = [];
    for (let i = 0; i < result.affectedRows; i++) {
      insertedIds.push(result.insertId + i); // Calculate the IDs based on insertId
    }
    const insertedItems = await db
      .promise()
      .query("SELECT * FROM skill_category_details WHERE id IN (?)", [insertedIds]);

    res.status(201).json(insertedItems[0]); // Send back the inserted items
  } catch (error) {
    console.error("Error during bulk insert:", error);
    res.status(500).json({ error: "Failed to insert items", exeption: error });
  }
});

router.put("/:id", (req, res) => {
  const categoryId = req.params.id;
  const { name, groupId } = req.body;

  if (!name || !groupId) {
    return res.status(400).json({ error: "Name and groupId are required" });
  }

  db.query(
    "UPDATE skill_category SET name = ?, group_id = ? WHERE id = ?", 
    [name, groupId, categoryId], 
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update category", exception: err });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      // Fetch the updated category with group name to return
      db.query(
        "SELECT * FROM skill_category_details WHERE id = ?",
        [categoryId],
        (err, results) => {
          if (err || results.length === 0) {
            return res.json({ id: parseInt(categoryId), name, group_id: groupId });
          }
          res.json(results[0]);
        }
      );
    }
  );
});

router.delete("/:id", (req, res) => {
  const categoryId = req.params.id;

  db.query("DELETE FROM skill_category WHERE id = ?", [categoryId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete group", exception: err });
    }
    res.status(204).send();
  });
});

module.exports = router;
