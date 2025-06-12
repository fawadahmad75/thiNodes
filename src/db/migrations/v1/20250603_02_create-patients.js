export function up(knex) {
  return knex.schema.createTable("patients", (table) => {
    // Use patientId as primary key instead of auto-increment id
    table.string("patientId", 50).primary();
    table.string("firstName", 100).notNullable().index(); // Added firstName
    table.string("lastName", 100).notNullable().index(); // Added lastName
    table.string("cnic", 15).unique(); // Added CNIC
    table.string("guardianName", 100).index(); // Added guardianName
    table.date("dateOfBirth"); // Replacing age with dateOfBirth
    table.enum("gender", ["male", "female", "other"]);
    table
      .enum("bloodGroup", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
      .nullable();
    table.string("contact", 20);
    table.string("address", 255);
    table.specificType("allergies", "text[]").defaultTo("{}"); // Array of allergies
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());

    // Add index for common searches in a busy OPD
    table.index(
      ["firstName", "lastName", "cnic", "guardianName", "contact"],
      "idx_patient_search"
    );
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("patients");
}
