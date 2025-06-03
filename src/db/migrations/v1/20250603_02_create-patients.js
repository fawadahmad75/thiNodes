exports.up = function (knex) {
  return knex.schema.createTable("patients", (table) => {
    table.increments("id").primary();
    table.string("patientId", 50).notNullable().unique().index();
    table.string("firstName", 100).notNullable().index(); // Added firstName
    table.string("lastName", 100).notNullable().index(); // Added lastName
    table.string("cnic", 15).unique(); // Added CNIC
    table.string("guardianName", 100).index(); // Added guardianName
    table.date("dateOfBirth"); // Replacing age with dateOfBirth
    table.enum("gender", ["male", "female", "other"]);
    table.string("contact", 20);
    table.string("address", 255);
    table.text("medicalHistory");
    table.text("allergies");
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());

    // Add index for common searches in a busy OPD
    table.index(
      ["firstName", "lastName", "cnic", "guardianName", "contact"],
      "idx_patient_search"
    );
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("patients");
};
