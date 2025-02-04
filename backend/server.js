require("dotenv").config({ path: `.env.${process.env.NODE_ENV || "development"}` });
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const validateToken = require("./auth"); // Import the token validation middleware
const validateAccessToken = require("./auth"); // Import the token validation middleware

// adding routes
const skillGroupsRouter = require("./routes/skill-groups");
const skillCategoriesRouter = require("./routes/skill-categories");
const skillsRouter = require("./routes/skills");
const projectsRouter = require("./routes/projects");
const projectSkillsRouter = require("./routes/project-skills");
const personRouter = require("./routes/person");

const app = express();
app.use(cors());
app.use(express.json());

// Database connection with reconnect handling
function handleDisconnect() {
  // Create a MySQL connection
  const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    insecureAuth: process.env.DB_INSECUREAUTH,
  });

  db.connect((err) => {
    if (err) {
      console.error("❌ Error connecting to MySQL database:", err);
      setTimeout(handleDisconnect, 2000); // Try to reconnect every 2 seconds
      return;
    }
    console.log("\n=== Database Connection Info ===");
    console.log("✅ MySQL Database connected successfully");
    console.log(`   Host: ${db.config.host}`);
    console.log(`   Database: ${db.config.database}`);
    console.log(`   User: ${db.config.user}`);
    console.log("==============================\n");
  });

  db.on("error", (err) => {
    console.error("MySQL database error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("Lost connection to MySQL database. Reconnecting...");
      handleDisconnect();
    } else {
      throw err;
    }
  });

  return db;
}

const db = handleDisconnect();

// Start server with connection status
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log("Environment Variables:", {
    NODE_ENV: process.env.NODE_ENV,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
  });

  console.log("\n=== Server Status ===");
  console.log(`✅ Server is running on port ${port}`);
  console.log(`   API Documentation: http://localhost:${port}/api-docs`);
  console.log("===================\n");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Closing HTTP server and database connection");
  server.close(() => {
    console.log("HTTP server closed");
    db.end(() => {
      console.log("Database connection closed");
      process.exit(0);
    });
  });
});

// Health check endpoint with detailed status
app.get("/health", async (req, res) => {
  try {
    const [results] = await db.promise().query("SELECT 1");
    res.json({
      status: "healthy",
      timestamp: new Date(),
      services: {
        server: {
          status: "running",
          uptime: process.uptime(),
          timestamp: new Date(),
        },
        database: {
          status: "connected",
          host: db.config.host,
          database: db.config.database,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      timestamp: new Date(),
      services: {
        server: {
          status: "running",
          uptime: process.uptime(),
          timestamp: new Date(),
        },
        database: {
          status: "disconnected",
          error: err.message,
        },
      },
    });
  }
});

// Protect routes with token validation
app.use("/api/protected", validateAccessToken, projectsRouter);

// app.use("/api/skill-groups", validateToken, skillGroupsRouter);
app.use("/api/skill-groups", validateAccessToken, skillGroupsRouter);
app.use("/api/skill-categories", validateAccessToken, skillCategoriesRouter);
app.use("/api/skill-categories/bulk", validateAccessToken, skillCategoriesRouter);
app.use("/api/skills", validateAccessToken, skillsRouter);
app.use("/api/projects", validateAccessToken, projectsRouter);
app.use("/api/project-skill", validateAccessToken, projectSkillsRouter);
app.use("/api/person", validateAccessToken, personRouter);
