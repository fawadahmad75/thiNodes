/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // First, clear all existing data to avoid conversion issues
  await knex("formulary").del();

  // Convert JSON fields to text arrays
  await knex.schema.alterTable("formulary", function (table) {
    // Drop existing JSON columns
    table.dropColumn("frequencyOptions");
    table.dropColumn("drugInteractions");
    table.dropColumn("sideEffects");
  });

  await knex.schema.alterTable("formulary", function (table) {
    // Add new array columns
    table.specificType("frequencyOptions", "text[]").defaultTo("{}");
    table.specificType("drugInteractions", "text[]").defaultTo("{}");
    table.specificType("sideEffects", "text[]").defaultTo("{}");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Convert back to JSON fields
  await knex.schema.alterTable("formulary", function (table) {
    table.dropColumn("frequencyOptions");
    table.dropColumn("drugInteractions");
    table.dropColumn("sideEffects");
  });
  await knex.schema.alterTable("formulary", function (table) {
    table.json("frequencyOptions").defaultTo("[]");
    table.json("drugInteractions").defaultTo("[]");
    table.json("sideEffects").defaultTo("[]");
  });
};
