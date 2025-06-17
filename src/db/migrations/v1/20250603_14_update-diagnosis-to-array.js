export function up(knex) {
  return knex.schema
    .alterTable("prescriptions", (table) => {
      // Drop the existing diagnosis column and recreate as JSON array
      table.dropColumn("diagnosis");
    })
    .then(() => {
      return knex.schema.alterTable("prescriptions", (table) => {
        table.json("diagnosis").notNullable().defaultTo("[]");
      });
    });
}

export function down(knex) {
  return knex.schema
    .alterTable("prescriptions", (table) => {
      table.dropColumn("diagnosis");
    })
    .then(() => {
      return knex.schema.alterTable("prescriptions", (table) => {
        table.text("diagnosis").notNullable();
      });
    });
}
