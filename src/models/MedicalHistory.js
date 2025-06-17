import db from "../db/index.js";

// Medical History model
class MedicalHistory {
  // Get medical history by patient ID
  static async findByPatientId(patientId) {
    return db("medical_history").where({ patientId }).first();
  }

  // Create new medical history
  static async create(historyData) {
    const [id] = await db("medical_history")
      .insert(historyData)
      .returning("id");
    return this.findById(id);
  }

  // Update medical history
  static async update(patientId, historyData) {
    historyData.updatedAt = db.fn.now();
    await db("medical_history").where({ patientId }).update(historyData);
    return this.findByPatientId(patientId);
  }

  // Find by ID
  static async findById(id) {
    return db("medical_history").where({ id }).first();
  }

  // Create or update medical history
  static async upsert(patientId, historyData) {
    const existing = await this.findByPatientId(patientId);

    if (existing) {
      return this.update(patientId, historyData);
    } else {
      return this.create({ ...historyData, patientId });
    }
  }

  // Get medical history with patient and doctor details
  static async findByPatientIdWithDetails(patientId) {
    return db("medical_history")
      .leftJoin("patients", "medical_history.patientId", "patients.patientId")
      .leftJoin("users", "medical_history.lastUpdatedBy", "users.id")
      .select(
        "medical_history.*",
        "patients.firstName",
        "patients.lastName",
        "users.name as lastUpdatedByName"
      )
      .where("medical_history.patientId", patientId)
      .first();
  }

  // Delete medical history
  static async delete(patientId) {
    return db("medical_history").where({ patientId }).del();
  }
}

export default MedicalHistory;
