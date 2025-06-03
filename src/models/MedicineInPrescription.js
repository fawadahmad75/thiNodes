import db from "../db/index.js";

// MedicineInPrescription model
class MedicineInPrescription {
  // Get all medicines for a prescription
  static async findByPrescriptionId(prescriptionId) {
    return db("medicines_in_prescription")
      .select("*")
      .where({ prescriptionId })
      .orderBy("id");
  }

  // Find medicine by ID
  static async findById(id) {
    return db("medicines_in_prescription").where({ id }).first();
  }

  // Create new medicine in prescription
  static async create(medicineData) {
    const [id] = await db("medicines_in_prescription")
      .insert(medicineData)
      .returning("id");
    return this.findById(id);
  }

  // Update medicine in prescription
  static async update(id, medicineData) {
    medicineData.updatedAt = db.fn.now();
    await db("medicines_in_prescription").where({ id }).update(medicineData);
    return this.findById(id);
  }

  // Delete medicine from prescription
  static async delete(id) {
    return db("medicines_in_prescription").where({ id }).del();
  }

  // Delete all medicines from a prescription
  static async deleteByPrescriptionId(prescriptionId) {
    return db("medicines_in_prescription").where({ prescriptionId }).del();
  }

  // Batch create multiple medicines in a prescription
  static async createMany(medicines) {
    if (!medicines || medicines.length === 0) return [];

    // Make sure all medicines have the same prescriptionId
    const prescriptionId = medicines[0].prescriptionId;

    // Set timestamps for all entries
    const now = new Date();
    const timestampedMedicines = medicines.map((medicine) => ({
      ...medicine,
      createdAt: now,
      updatedAt: now,
    }));

    // Batch insert and return IDs
    const ids = await db("medicines_in_prescription")
      .insert(timestampedMedicines)
      .returning("id");

    // Return all inserted medicines
    return db("medicines_in_prescription")
      .select("*")
      .whereIn("id", ids)
      .orderBy("id");
  }
}

export default MedicineInPrescription;
