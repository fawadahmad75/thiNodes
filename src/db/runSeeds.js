import knex from "knex";
import knexConfig from "./knexfile.js";

const environment = process.env.NODE_ENV || "development";
const config = knexConfig[environment];
const db = knex(config);

async function runSeeds() {
  try {
    console.log("Running seeds...");
    await db.seed.run();
    console.log("Seeds completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error running seeds:", error);
    process.exit(1);
  }
}

runSeeds();
