require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

// adding routes
const skillsRouter = require("./routes/skills");
const skillCategoriesRouter = require("./routes/skill-categories");
const projectsRouter = require("./routes/projects");
const personRouter = require("./routes/person");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/skills", skillsRouter);
app.use("/api/skill-categories", skillCategoriesRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/person", personRouter);

// Database connection with reconnect handling
function handleDisconnect() {
  // Create a MySQL connection
  const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    insecureAuth: "true",
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
