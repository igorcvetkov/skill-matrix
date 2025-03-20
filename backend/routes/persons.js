const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Get all persons
router.get("/", (req, res) => {
  // Get query parameters for filtering
  const { name, email, role } = req.query;
  
  // Base query to get distinct person IDs with basic info
  let query = `
    SELECT DISTINCT ps.person_id, 
           u.name,
           u.email,
           u.role
    FROM person_skill ps 
    LEFT JOIN users u ON ps.person_id = u.id
    WHERE 1=1
  `;
  
  const params = [];

  // Add filters if provided
  if (name) {
    query += " AND u.name LIKE ?";
    params.push(`%${name}%`);
  }
  
  if (email) {
    query += " AND u.email LIKE ?";
    params.push(`%${email}%`);
  }
  
  if (role) {
    query += " AND u.role = ?";
    params.push(role);
  }

  // Only allow admins and project managers to see all users
  // For regular users, only return their own data
  // if (!req.user.roles.includes("admin") && !req.user.roles.includes("project.manager")) {
  //   query += " AND ps.person_id = ?";
  //   params.push(req.user.id);
  // }

  db.query(query, params, (err, results) => {
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
    
    res.json(results);
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
