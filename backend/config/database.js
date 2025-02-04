const mysql = require("mysql2");
const { Pool } = require("pg");

const dbConfig = {
  // Add your MySQL configuration
  mysql: {
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
  },
  // Add your PostgreSQL configuration
  postgres: {
    host: "postgres_host",
    user: "postgres_user",
    password: "postgres_password",
    database: "postgres_db",
  },
};

// Choose the database type (mysql or postgres)
const dbType = process.env.DB_TYPE || "mysql"; // Default to MySQL

let db;

if (dbType === "mysql") {
  db = mysql.createConnection(dbConfig.mysql);
} else if (dbType === "postgres") {
  db = new Pool(dbConfig.postgres);
} else {
  throw new Error("Unsupported database type");
}

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    console.error("Connection params:", dbConfig[dbType]);
    return;
  }
  console.log("Connected to database");
});

module.exports = db;
