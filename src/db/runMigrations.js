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

// Run migrations
async function runMigrations() {
  try {
    console.log("Running database migrations...");
    const result = await db.migrate.latest();

    if (result[1].length === 0) {
      console.log("No new migrations to run.");
    } else {
      console.log(`Ran ${result[1].length} migrations successfully.`);
      console.log("Migrations complete!");
    }

    process.exit(0);
  } catch (error) {
    console.error("Migration failed!", error);
    process.exit(1);
  }
}

runMigrations();
