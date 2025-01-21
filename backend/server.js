const express = require("express");
const mysql = require("mysql");
const app = express();
const port = 3000;

// Create a MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "your_username", // replace with your MySQL username
  password: "your_password", // replace with your MySQL password
  database: "your_database", // replace with your MySQL database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL connected...");
});

// Example route to fetch data
app.get("/api/data", (req, res) => {
  db.query("SELECT * FROM your_table", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
