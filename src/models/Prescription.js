import db from "../db/index.js";

// Prescription model
class Prescription {
  // Get all prescriptions with optional filters
  static async findAll(filters = {}, page = 1, limit = 10) {
    const query = db("prescriptions").select("*");

    // Apply filters if provided
    if (filters.patientId) query.where({ patientId: filters.patientId });
    if (filters.doctorId) query.where({ doctorId: filters.doctorId });
    if (filters.status) query.where({ status: filters.status });
    if (filters.dateFrom) query.where("date", ">=", filters.dateFrom);
    if (filters.dateTo) query.where("date", "<=", filters.dateTo);

    // Apply pagination
    const offset = (page - 1) * limit;
    query.offset(offset).limit(limit);

    return query;
  }

  // Find prescription by ID
  static async findById(id) {
    return db("prescriptions").where({ id }).first();
  }
  // Find prescriptions by patient ID (patientId is now a string from Oracle)
  static async findByPatientId(patientId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return db("prescriptions")
      .select("*")
      .where({ patientId }) // patientId is now a string reference
      .orderBy("date", "desc")
      .offset(offset)
      .limit(limit);
  }

  // Find prescriptions by doctor ID
  static async findByDoctorId(doctorId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return db("prescriptions")
      .select("*")
      .where({ doctorId })
      .orderBy("date", "desc")
      .offset(offset)
      .limit(limit);
  }

  // Create new prescription
  static async create(prescriptionData) {
    const [id] = await db("prescriptions")
      .insert(prescriptionData)
      .returning("id");
    return this.findById(id);
  }

  // Update prescription
  static async update(id, prescriptionData) {
    prescriptionData.updatedAt = db.fn.now();
    await db("prescriptions").where({ id }).update(prescriptionData);
    return this.findById(id);
  }

  // Delete prescription
  static async delete(id) {
    return db("prescriptions").where({ id }).del();
  }

  // Update prescription status
  static async updateStatus(id, status) {
    return db("prescriptions").where({ id }).update({
      status,
      updatedAt: db.fn.now(),
    });
  }

  // Get complete prescription with medicines and advised tests
  static async getCompletePrescription(id) {
    // Get prescription details
    const prescription = await this.findById(id);
    if (!prescription) return null;

    // Get medicines for this prescription
    const medicines = await db("medicines_in_prescription").where({
      prescriptionId: id,
    });

    // Get advised tests for this prescription
    const tests = await db("advised_tests_in_prescription").where({
      prescriptionId: id,
    });

    return {
      ...prescription,
      medicines,
      advisedTests: tests,
    };
  }
}

export default Prescription;
