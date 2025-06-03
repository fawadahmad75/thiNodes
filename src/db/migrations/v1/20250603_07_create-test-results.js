exports.up = function (knex) {
  return knex.schema.createTable("test_results", (table) => {
    table.increments("id").primary();
    table
      .integer("patientId")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("patients")
      .onDelete("CASCADE");
    table
      .integer("doctorId")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users");
    table
      .integer("advisedTestId")
      .unsigned()
      .references("id")
      .inTable("advised_tests_in_prescription")
      .onDelete("SET NULL");
    table.string("testName", 100).notNullable();
    table.timestamp("testDate").notNullable().defaultTo(knex.fn.now());
    table.text("resultNotes");
    table.string("fileUrl", 255);
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());

    // Indexes for retrieving test results
    table.index(["patientId", "testDate"], "idx_test_results_patient");
    table.index(["advisedTestId"], "idx_test_results_advised_test");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("test_results");
};
