export const seed = async function (knex) {
  // First, delete existing entries to avoid duplicates
  await knex("medical_history").del();

  // Insert sample medical history data
  await knex("medical_history").insert([
    {
      patientId: "THI-001", // Assuming this patient exists from patient seeds
      existingConditions: ["Hypertension", "Diabetes Type 2"],
      previousSurgeries: [
        { surgery: "Gallbladder Surgery", date: "2022-03-15", hospital: "THI" },
      ],
      bloodGroup: "A+",
      allergies: ["Penicillin", "Aspirin"],
      majorConditions: [],
      immunizations: [
        { vaccine: "COVID-19", date: "2023-01-15", notes: "Pfizer 2nd dose" },
        {
          vaccine: "Influenza (Flu)",
          date: "2023-10-01",
          notes: "Annual flu shot",
        },
      ],
      chronicMedications: [
        { medicine: "Metformin", dosage: "500mg", frequency: "Twice daily" },
        { medicine: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
      ],
      familyHistory: ["Heart Disease", "Diabetes"],
      lastUpdatedBy: 2, // Assuming doctor user ID is 2
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      patientId: "THI-002", // Assuming this patient exists
      existingConditions: ["Asthma"],
      previousSurgeries: [],
      bloodGroup: "O+",
      allergies: ["Dust", "Pollen"],
      majorConditions: [],
      immunizations: [
        { vaccine: "COVID-19", date: "2023-02-10", notes: "Moderna 1st dose" },
      ],
      chronicMedications: [
        {
          medicine: "Albuterol Inhaler",
          dosage: "90mcg",
          frequency: "As needed",
        },
      ],
      familyHistory: ["Asthma", "Allergies"],
      lastUpdatedBy: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
};
