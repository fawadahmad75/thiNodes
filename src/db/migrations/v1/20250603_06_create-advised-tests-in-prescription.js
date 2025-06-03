exports.up = function (knex) {
  return knex.schema.createTable("advised_tests_in_prescription", (table) => {
    table.increments("id").primary();
    table
      .integer("prescriptionId")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("prescriptions")
      .onDelete("CASCADE");
    table.string("testName", 100).notNullable();
    table.text("instructions");
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());

    // Index for quick retrieval of tests for a prescription
    table.index(["prescriptionId"], "idx_advised_tests_prescription");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("advised_tests_in_prescription");
};
