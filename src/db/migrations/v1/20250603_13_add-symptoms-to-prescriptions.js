export function up(knex) {
  return knex.schema.alterTable("prescriptions", (table) => {
    table.text("symptoms");
  });
}

export function down(knex) {
  return knex.schema.alterTable("prescriptions", (table) => {
    table.dropColumn("symptoms");
  });
}
