exports.up = function (knex) {
  return knex.schema
    .createTable("print_settings", (table) => {
      table.increments("id").primary();
      table.text("headerText");
      table.text("footerText");
      table.boolean("showLogo").notNullable().defaultTo(true);
      table.boolean("showDoctorInfo").notNullable().defaultTo(true);
      table.boolean("showPatientId").notNullable().defaultTo(true);
      table.string("fontSize", 20).notNullable().defaultTo("medium");
      table.string("paperSize", 20).notNullable().defaultTo("a4");
      table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
      table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());
    })
    .then(() => {
      // Insert default print settings
      return knex("print_settings").insert({
        headerText: "Hospital Prescription",
        footerText: "Thank you for visiting our hospital",
        showLogo: true,
        showDoctorInfo: true,
        showPatientId: true,
        fontSize: "medium",
        paperSize: "a4",
      });
    });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("print_settings");
};
