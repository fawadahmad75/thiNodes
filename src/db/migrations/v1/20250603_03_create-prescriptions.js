export function up(knex) {
  return knex.schema.createTable("prescriptions", (table) => {
    table.increments("id").primary();
    table
      .string("patientId", 50)
      .notNullable()
      .references("patientId")
      .inTable("patients")
      .onDelete("CASCADE");
    table
      .integer("doctorId")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users");
    table.timestamp("date").notNullable().defaultTo(knex.fn.now());
    table.text("clinicalNotes");
    table.text("additionalInstructions");
    table
      .enum("status", ["active", "completed", "discontinued"])
      .notNullable()
      .defaultTo("active");
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());

    // Add indexes for fast retrieval in busy OPD
    table.index(["patientId", "date"], "idx_prescription_patient_date");
    table.index(["doctorId", "date"], "idx_prescription_doctor_date");
    table.index(["status"], "idx_prescription_status");
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("prescriptions");
}
