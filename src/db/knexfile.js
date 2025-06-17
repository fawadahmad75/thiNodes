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
    // Enhanced connection pooling for scalability
    pool: {
      min: 5, // Minimum number of connections in pool
      max: 25, // Maximum number of connections in pool
      acquireTimeoutMillis: 60000, // 60 seconds
      idleTimeoutMillis: 600000, // 10 minutes
      createTimeoutMillis: 30000, // 30 seconds
      destroyTimeoutMillis: 5000, // 5 seconds
      reapIntervalMillis: 1000, // 1 second
      createRetryIntervalMillis: 200, // 200ms
    },
    migrations: { directory: "./migrations/v1", tableName: "knex_migrations" },
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
      min: 10,
      max: 50, // Higher for production
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 600000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
    },
    migrations: { directory: "./migrations", tableName: "knex_migrations" },
    seeds: { directory: path.join(__dirname, "seeds") },
  },
};
