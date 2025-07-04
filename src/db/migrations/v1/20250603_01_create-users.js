export function up(knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("username", 50).notNullable().unique().index();
    table.string("password").notNullable();
    table.string("name", 100).notNullable();
    table.string("email", 100).notNullable();
    table.notNullable().defaultTo("doctor");
    table.specificType("departments", "integer[]").defaultTo("{}"); // Array of department IDs
    table.string("specialization", 100);
    table.string("licenseNumber", 50);
    table.string("contactNumber", 20);
    table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());
    // Add login tracking for audit
    table.timestamp("lastLoginAt");

    // Add index for common queries
    table.index(["role", "name"], "idx_users_role_name");
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("users");
}
