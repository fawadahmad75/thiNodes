import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({
  path: path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../.env"
  ),
});

export default {
  development: {
    client: process.env.DB_CLIENT,
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
      // Optional: custom afterCreate handler & idleTimeoutMillis, etc.
      // afterCreate: (conn, done) => { ... }
      // idleTimeoutMillis: 30000
    },
    migrations: { directory: "./migrations", tableName: "knex_migrations" },
    seeds: { directory: "./seeds" },
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
      min: 4, // You may want a higher min in production
      max: 20, // And a higher max for heavier loads
      // Example advanced settings:
      // idleTimeoutMillis: 60000, // 1 minute
      // createTimeoutMillis: 3000,
      // acquireTimeoutMillis: 30000,
      // reapIntervalMillis: 1000,
      // propagateCreateError: false
    },
    migrations: { directory: "./migrations", tableName: "knex_migrations" },
    seeds: { directory: "./seeds" },
  },
};
