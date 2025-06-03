exports.up = async function (knex) {
  // This migration handles the transition from auto-incremented id to Oracle patientId as primary key

  // First drop foreign key constraints from related tables
  await knex.schema.table("prescriptions", (table) => {
    table.dropForeign("patientId");
  });

  await knex.schema.table("test_results", (table) => {
    table.dropForeign("patientId");
  });

  // Modify patients table
  await knex.schema.table("patients", (table) => {
    // Drop the old primary key constraint
    table.dropPrimary();
    // Drop the auto-increment id column (after data migration if needed)
    table.dropColumn("id");
  });

  // Recreate foreign key constraints
  await knex.schema.table("prescriptions", (table) => {
    table
      .foreign("patientId")
      .references("patientId")
      .inTable("patients")
      .onDelete("CASCADE");
  });

  await knex.schema.table("test_results", (table) => {
    table
      .foreign("patientId")
      .references("patientId")
      .inTable("patients")
      .onDelete("CASCADE");
  });
};

exports.down = async function (knex) {
  // First drop foreign key constraints
  await knex.schema.table("prescriptions", (table) => {
    table.dropForeign("patientId");
  });

  await knex.schema.table("test_results", (table) => {
    table.dropForeign("patientId");
  });

  // Revert the patients table to use auto-increment id as primary key
  await knex.schema.table("patients", (table) => {
    // Add back the id column with auto-increment
    table.increments("id").primary();
    // Change patientId back to unique but not primary
    table.string("patientId", 50).notNullable().unique().index().alter();
  });

  // Recreate foreign key constraints to point to id
  await knex.schema.table("prescriptions", (table) => {
    table.integer("patientId").unsigned().alter();
    table
      .foreign("patientId")
      .references("id")
      .inTable("patients")
      .onDelete("CASCADE");
  });

  await knex.schema.table("test_results", (table) => {
    table.integer("patientId").unsigned().alter();
    table
      .foreign("patientId")
      .references("id")
      .inTable("patients")
      .onDelete("CASCADE");
  });
};
