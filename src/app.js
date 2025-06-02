import express from "express";
import db from "./db/index.js"; // Your Knex instance

const app = express();

app.use(express.json());

// Export the configured app
export default app;
