module.exports.up = function up(knex) {
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
    table.json("frequencyOptions");
    table.json("drugInteractions");
    table.json("sideEffects");
    table.text("dosageGuidelines");
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());

    // Indexes for fast searching in formulary
    table.index(["name", "genericName"], "idx_formulary_search");
    table.index(["category"], "idx_formulary_category");
  });
};

module.exports.down = function down(knex) {
  return knex.schema.dropTableIfExists("formulary");
};
