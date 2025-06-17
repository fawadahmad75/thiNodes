export function up(knex) {
  return knex.schema.createTable("medical_history", (table) => {
    table.increments("id").primary();
    table
      .string("patientId", 50)
      .notNullable()
      .references("patientId")
      .inTable("patients")
      .onDelete("CASCADE");

    // Predefined existing conditions
    table.specificType("existingConditions", "text[]").defaultTo("{}"); // Array of predefined conditions

    // Previous surgeries with dates
    table.specificType("previousSurgeries", "jsonb[]").defaultTo("{}"); // Array of {surgery, date, hospital}

    // Blood group (moved from patients table for better organization)
    table
      .enum("bloodGroup", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
      .nullable();

    // Allergies
    table.specificType("allergies", "text[]").defaultTo("{}"); // Array of predefined allergies

    // Major conditions
    table.specificType("majorConditions", "text[]").defaultTo("{}"); // Array of predefined major conditions

    // Immunizations
    table.specificType("immunizations", "jsonb[]").defaultTo("{}"); // Array of {vaccine, date, notes}

    // Chronic medications
    table.specificType("chronicMedications", "jsonb[]").defaultTo("{}"); // Array of {medicine, dosage, frequency}

    // Family history
    table.specificType("familyHistory", "text[]").defaultTo("{}"); // Array of family conditions

    // Last updated by which doctor
    table.integer("lastUpdatedBy").unsigned().references("id").inTable("users");

    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());

    // Index for fast retrieval
    table.index(["patientId"], "idx_medical_history_patient");
    table.index(["lastUpdatedBy"], "idx_medical_history_doctor");
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("medical_history");
}
