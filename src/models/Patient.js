import db from "../db/index.js";

// Patient model
class Patient {
  // Get all patients with optional filters
  static async findAll(filters = {}, page = 1, limit = 10) {
    const query = db("patients").select("*");

    // Apply filters if provided
    if (filters.search) {
      query.where(function () {
        this.where("firstName", "like", `%${filters.search}%`)
          .orWhere("lastName", "like", `%${filters.search}%`)
          .orWhere("cnic", "like", `%${filters.search}%`)
          .orWhere("contact", "like", `%${filters.search}%`)
          .orWhere("guardianName", "like", `%${filters.search}%`);
      });
    }
    if (filters.patientId) query.where({ patientId: filters.patientId });
    if (filters.dateFrom) query.where("createdAt", ">=", filters.dateFrom);
    if (filters.dateTo) query.where("createdAt", "<=", filters.dateTo);

    // Apply sort
    query.orderBy("createdAt", "desc");

    // Apply pagination
    const offset = (page - 1) * limit;
    query.offset(offset).limit(limit);

    return query;
  }

  // Count total patients with filters
  static async countAll(filters = {}) {
    const query = db("patients").count("* as count");

    // Apply the same filters as findAll
    if (filters.search) {
      query.where(function () {
        this.where("firstName", "like", `%${filters.search}%`)
          .orWhere("lastName", "like", `%${filters.search}%`)
          .orWhere("cnic", "like", `%${filters.search}%`)
          .orWhere("contact", "like", `%${filters.search}%`)
          .orWhere("guardianName", "like", `%${filters.search}%`);
      });
    }
    if (filters.patientId) query.where({ patientId: filters.patientId });
    if (filters.dateFrom) query.where("createdAt", ">=", filters.dateFrom);
    if (filters.dateTo) query.where("createdAt", "<=", filters.dateTo);

    const result = await query.first();
    return parseInt(result.count);
  } // Find patient by ID (which is now patientId)
  static async findById(id) {
    return db("patients").where({ patientId: id }).first();
  }

  // Find patient by patient ID - alias for findById for backward compatibility
  static async findByPatientId(patientId) {
    return this.findById(patientId);
  }

  // Find patient by CNIC
  static async findByCNIC(cnic) {
    return db("patients").where({ cnic }).first();
  }
  // Create new patient
  static async create(patientData) {
    if (!patientData.patientId) {
      throw new Error(
        "patientId is required and must be provided from the Oracle system"
      );
    }

    await db("patients").insert(patientData);
    return this.findById(patientData.patientId);
  }
  // Update patient
  static async update(id, patientData) {
    patientData.updatedAt = db.fn.now();
    await db("patients").where({ patientId: id }).update(patientData);
    return this.findById(id);
  }

  // Delete patient
  static async delete(id) {
    return db("patients").where({ patientId: id }).del();
  }

  // Calculate age from dateOfBirth
  static calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}

export default Patient;
