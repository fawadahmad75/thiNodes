export function up(knex) {
  return knex.schema.createTable("departments", (table) => {
    table.increments("id").primary();
    table.string("name", 100).notNullable().unique();
    table.text("description");
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());

    // Add index for fast retrieval by name
    table.index(["name"], "idx_department_name");
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("departments");
}
