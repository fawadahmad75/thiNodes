export function up(knex) {
  return knex.schema.alterTable("advised_tests_in_prescription", (table) => {
    table
      .enum("when_to_do", ["this_visit", "next_visit", "as_needed"])
      .defaultTo("this_visit");
  });
}

export function down(knex) {
  return knex.schema.alterTable("advised_tests_in_prescription", (table) => {
    table.dropColumn("when_to_do");
  });
}
