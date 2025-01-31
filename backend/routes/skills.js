const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Skills endpoints
router.get("/", (req, res) => {
  const { categoryId } = req.query;
  let query = `
      SELECT s.*, sc.name as category_name 
      FROM skill s 
      LEFT JOIN skill_category sc ON s.category_id = sc.id
      WHERE 1=1
    `;

  const params = [];
  if (categoryId) {
    query += " AND category_id = ?";
    params.push(categoryId);
  }
  db.query(query, params, (err, results) => {
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

module.exports = router;
