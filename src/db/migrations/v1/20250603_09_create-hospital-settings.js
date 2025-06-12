export function up(knex) {
  return knex.schema
    .createTable("hospital_settings", (table) => {
      table.increments("id").primary();
      table.string("hospitalName", 100).notNullable();
      table.string("address", 255).notNullable();
      table.string("phone", 20).notNullable();
      table.string("email", 100).notNullable();
      table.string("website", 100);
      table.string("logo", 255);
      table.text("headerText");
      table.text("footerText");
      table.timestamp("createdAt").notNullable().defaultTo(knex.fn.now());
      table.timestamp("updatedAt").notNullable().defaultTo(knex.fn.now());
    })
    .then(() => {
      // Insert default hospital settings
      return knex("hospital_settings").insert({
        hospitalName: "Tahir Heart Institute",
        address: "Aqsa Road, Chenab Nagar",
        phone: "+1-234-567-8900",
        email: "info@tahirheart.com",
        website: "www.tahirheartinstitute.com",
        headerText: "Providing Quality Healthcare",
        footerText: "© 2025 Tahir Heart Institute. All rights reserved.",
      });
    });
};

export function down(knex) {
  return knex.schema.dropTableIfExists("hospital_settings");
};
