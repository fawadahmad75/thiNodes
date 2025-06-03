import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

export default {
  development: {
    client: "pg", // Hardcode instead of using process.env.DB_CLIENT
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    },
    // Connection pooling settings:
    pool: {
      min: 2, // Minimum number of connections in pool
      max: 10, // Maximum number of connections in pool
    },
    migrations: { directory: "./migrations", tableName: "knex_migrations" },
    seeds: { directory: path.join(__dirname, "seeds") },
  },
  production: {
    client: process.env.DB_CLIENT,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 4,
      max: 20,
    },
    migrations: { directory: "./migrations", tableName: "knex_migrations" },
    seeds: { directory: path.join(__dirname, "seeds") },
  },
};
