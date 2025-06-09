export function up(knex) {
  return knex.schema.createTable("medicines_in_prescription", (table) => {
    table.increments("id").primary();
    table
      .integer("prescriptionId")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("prescriptions")
      .onDelete("CASCADE");
    table
      .integer("medicineId")
      .unsigned()
      .references("id")
      .inTable("formulary");
    table.string("medicineName", 100).notNullable();
    table
      .enum("dosageForm", [
        "tablet",
        "capsule",
        "syrup",
        "injection",
        "cream",
        "ointment",
        "drops",
        "inhaler",
        "patch",
        "other",
      ])
      .notNullable();
    table.string("strength", 50).notNullable();
    table.string("dosage", 50).notNullable();
    table.string("frequency", 50).notNullable();
    table.string("duration", 50).notNullable();
    table.text("instructions");
    table.boolean("isCustom").notNullable().defaultTo(false);
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());

    // Index for quick retrieval of medicines for a prescription
    table.index(["prescriptionId"], "idx_medicines_prescription");
  });
};

export function down(knex) {
  return knex.schema.dropTableIfExists("medicines_in_prescription");
};
