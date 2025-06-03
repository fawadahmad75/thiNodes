import bcrypt from "bcrypt";

export async function seed(knex) {
  // First, delete existing entries to avoid duplicates
  await knex("users").del();

  // Create password hash
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("admin123", salt);
  const doctorPassword = await bcrypt.hash("doctor123", salt);

  // Insert seed entries
  await knex("users").insert([
    {
      username: "admin",
      password: adminPassword,
      name: "System Administrator",
      email: "admin@thi.com",
      role: "admin",
      departments: ["administration"],
      specialization: null,
      licenseNumber: null,
      contactNumber: "0300-0000000",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      username: "doctor",
      password: doctorPassword,
      name: "Dr. John Doe",
      email: "doctor@thi.com",
      role: "doctor",
      departments: ["cardiology"],
      specialization: "Cardiologist",
      licenseNumber: "PMC-123456",
      contactNumber: "0300-1111111",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}
