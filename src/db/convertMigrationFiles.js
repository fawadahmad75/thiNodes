import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, "./migrations/v1");

// Read all migration files
console.log(`Reading migration files from: ${migrationsDir}`);
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".js"));

console.log(
  `Found ${migrationFiles.length} migration files: ${migrationFiles.join(", ")}`
);

// Process each file
migrationFiles.forEach((file) => {
  const filePath = path.join(migrationsDir, file);

  // Read the file content
  const content = fs.readFileSync(filePath, "utf8");

  // Convert CommonJS exports to ES modules
  const newContent = content
    .replace(/exports\.up = function \(knex\) \{/, "export function up(knex) {")
    .replace(
      /exports\.down = function \(knex\) \{/,
      "export function down(knex) {"
    );

  // Write the modified content back
  fs.writeFileSync(filePath, newContent);

  console.log(`Converted ${file} to ES modules format`);
});

console.log("All migration files converted successfully!");
