export function up(knex) {
  return knex.schema.table("prescriptions", (table) => {
    // Check if diagnosis column doesn't exist and add it
    table.text("diagnosis");
  });
}

export function down(knex) {
  return knex.schema.table("prescriptions", (table) => {
    table.dropColumn("diagnosis");
  });
}
