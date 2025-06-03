import knex from "knex";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Configure knex
const config = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
  migrations: {
    directory: path.join(__dirname, "./migrations/v1"),
    tableName: "knex_migrations",
  },
};

// Initialize knex
const db = knex(config);

// Rollback migrations
async function rollbackMigrations() {
  try {
    console.log("Rolling back the most recent migration batch...");
    const result = await db.migrate.rollback();

    if (result[1].length === 0) {
      console.log("No migrations to rollback.");
    } else {
      console.log(`Rolled back ${result[1].length} migrations successfully.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Rollback failed!", error);
    process.exit(1);
  }
}

rollbackMigrations();
