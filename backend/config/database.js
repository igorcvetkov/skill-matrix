const mysql = require("mysql2");

const dbParams = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  insecureAuth: process.env.DB_INSECUREAUTH,
  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized: true,
        }
      : false,
  connectTimeout: 10000, // Increase timeout for AWS connection
  // insecureAuth: "true",
};

const db = mysql.createConnection(dbParams);

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    console.error("Connection params:", dbParams);
    return;
  }
  console.log("Connected to database");
});

module.exports = db;
