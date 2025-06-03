import knex from "knex";
import knexConfig from "./knexfile.js";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.NODE_ENV || "development";
const db = knex(knexConfig[env]);

export default db;
