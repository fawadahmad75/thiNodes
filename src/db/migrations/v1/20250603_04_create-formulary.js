export function up(knex) {
  return knex.schema.createTable("formulary", (table) => {
    table.increments("id").primary();
    table.string("name", 100).notNullable().index();
    table
      .enum("category", [
        "tablet",
        "injection",
        "insulin injection",
        "capsule",
        "solution",
        "syrup",
        "inhaler",
        "suspension",
        "soft capsule",
        "drops",
        "effervescent tablet",
        "sachet powder",
        "gel",
        "nebulising solution",
        "powder",
        "cream",
        "ointment",
        "emulsion",
        "rotcaps",
        "device",
      ])
      .notNullable();
    table.string("strength", 50).notNullable();
    table.string("genericName", 255);
    table.specificType("frequencyOptions", "text[]").defaultTo("{}"); // Array of frequency options
    table.specificType("drugInteractions", "text[]").defaultTo("{}"); // Array of drug interactions
    table.specificType("sideEffects", "text[]").defaultTo("{}"); // Array of side effects
    table.text("dosageGuidelines");
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());

    // Indexes for fast searching in formulary
    table.index(["name", "genericName"], "idx_formulary_search");
    table.index(["category"], "idx_formulary_category");
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("formulary");
}
