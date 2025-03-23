const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Get all persons
router.get("/", (req, res) => {
  // Query to get distinct person IDs only
  const query = `SELECT DISTINCT person_id FROM person_skill`;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching persons:", err);
      return res.status(500).json({ error: "Failed to fetch persons" });
    }
    
    // If no results found, return empty array
    if (results.length === 0) {
      // For development purposes, always return at least one mock user
      if (process.env.NODE_ENV === 'development') {
        return res.json([
          { 
            person_id: "mock-user-1",
            name: "John Doe",
            email: "john.doe@example.com",
            role: "user"
          },
          {
            person_id: "mock-user-2",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            role: "user" 
          },
          {
            person_id: "mock-admin-1",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin"
          }
        ]);
      }
      return res.json([]);
    }
    
    // Transform results to include name = person_id
    const persons = results.map(result => ({
      person_id: result.person_id,
      name: result.person_id // Use person_id as name since that's what the frontend expects
    }));
    
    res.json(persons);
  });
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
