export const seed = async function (knex) {
  // First, delete existing entries to avoid duplicates
  await knex("departments").del();

  // Insert seed entries
  await knex("departments").insert([
    {
      id: 1,
      name: "Administration",
      description: "Administrative and management department",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: "Cardiology",
      description: "Heart and cardiovascular diseases treatment",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: "Emergency",
      description: "Emergency and trauma care",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      name: "Pharmacy",
      description: "Medication dispensing and pharmaceutical services",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 5,
      name: "Pediatrics",
      description: "Children's healthcare and treatment",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 6,
      name: "General Medicine",
      description: "General medical consultation and treatment",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
};
