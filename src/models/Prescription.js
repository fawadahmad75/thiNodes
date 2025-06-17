import db from "../db/index.js";

// Prescription model
class Prescription {
  // Get all prescriptions with optional filters - OPTIMIZED for scale
  static async findAll(filters = {}, page = 1, limit = 10) {
    const query = db("prescriptions")
      .select(
        "id",
        "patientId",
        "doctorId",
        "date",
        "diagnosis",
        "status",
        "createdAt"
      ) // Select only needed fields
      .orderBy("date", "desc"); // Use index

    // Apply filters with optimized queries
    if (filters.patientId) query.where({ patientId: filters.patientId });
    if (filters.doctorId) query.where({ doctorId: filters.doctorId });
    if (filters.status) query.where({ status: filters.status });

    // Optimized date range queries using composite index
    if (filters.dateFrom && filters.dateTo) {
      query.whereBetween("date", [filters.dateFrom, filters.dateTo]);
    } else {
      if (filters.dateFrom) query.where("date", ">=", filters.dateFrom);
      if (filters.dateTo) query.where("date", "<=", filters.dateTo);
    }

    // Apply pagination with limit to prevent large result sets
    const safeLimit = Math.min(limit, 100); // Cap at 100 records
    const offset = (page - 1) * safeLimit;
    query.offset(offset).limit(safeLimit);

    const prescriptions = await query;
    return prescriptions.map((prescription) =>
      this.parsePrescriptionData(prescription)
    );
  }

  // Find prescription by ID
  static async findById(id) {
    const prescription = await db("prescriptions").where({ id }).first();
    if (prescription) {
      return this.parsePrescriptionData(prescription);
    }
    return null;
  }

  // Parse prescription data to handle JSON fields
  static parsePrescriptionData(prescription) {
    if (!prescription) return null;

    try {
      // Parse diagnosis if it's a JSON string
      if (typeof prescription.diagnosis === "string") {
        try {
          prescription.diagnosis = JSON.parse(prescription.diagnosis);
        } catch {
          // If parsing fails, treat as single diagnosis and convert to array
          prescription.diagnosis = [prescription.diagnosis];
        }
      }
    } catch (error) {
      console.error("Error parsing prescription data:", error);
    }

    return prescription;
  }
  // Find prescriptions by patient ID (patientId is now a string from Oracle)
  static async findByPatientId(patientId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const prescriptions = await db("prescriptions")
      .select("*")
      .where({ patientId }) // patientId is now a string reference
      .orderBy("date", "desc")
      .offset(offset)
      .limit(limit);

    return prescriptions.map((prescription) =>
      this.parsePrescriptionData(prescription)
    );
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

  // Find all prescriptions with patient and doctor details
  static async findAllWithDetails(filters = {}, page = 1, limit = 20) {
    const query = db("prescriptions")
      .leftJoin("patients", "prescriptions.patientId", "patients.patientId")
      .leftJoin("users", "prescriptions.doctorId", "users.id")
      .select(
        "prescriptions.*",
        "patients.firstName",
        "patients.lastName",
        "patients.dateOfBirth",
        "patients.gender",
        "patients.contact",
        db.raw('EXTRACT(YEAR FROM AGE(patients."dateOfBirth")) as age'),
        db.raw(
          "json_build_object('firstName', patients.\"firstName\", 'lastName', patients.\"lastName\", 'dateOfBirth', patients.\"dateOfBirth\", 'gender', patients.gender, 'contact', patients.contact) as patient"
        ),
        db.raw(
          "json_build_object('name', users.name, 'specialization', users.specialization) as doctor"
        )
      );

    // Apply filters if provided
    if (filters.patientId)
      query.where("prescriptions.patientId", filters.patientId);
    if (filters.doctorId)
      query.where("prescriptions.doctorId", filters.doctorId);
    if (filters.status) query.where("prescriptions.status", filters.status);
    if (filters.dateFrom)
      query.where("prescriptions.date", ">=", filters.dateFrom);
    if (filters.dateTo) query.where("prescriptions.date", "<=", filters.dateTo);

    // Apply pagination and ordering
    const offset = (page - 1) * limit;
    query.orderBy("prescriptions.date", "desc").offset(offset).limit(limit);

    return query;
  }

  // Count all prescriptions with filters
  static async countAll(filters = {}) {
    const query = db("prescriptions").count("id as count");

    // Apply filters if provided
    if (filters.patientId) query.where({ patientId: filters.patientId });
    if (filters.doctorId) query.where({ doctorId: filters.doctorId });
    if (filters.status) query.where({ status: filters.status });
    if (filters.dateFrom) query.where("date", ">=", filters.dateFrom);
    if (filters.dateTo) query.where("date", "<=", filters.dateTo);

    const result = await query.first();
    return parseInt(result.count);
  }

  // Create new prescription
  static async create(prescriptionData) {
    try {
      const result = await db("prescriptions")
        .insert(prescriptionData)
        .returning("id");

      console.log("Create prescription result:", result);

      // Extract the actual ID value (PostgreSQL returns an object)
      let id;
      if (Array.isArray(result) && result.length > 0) {
        id = typeof result[0] === "object" ? result[0].id : result[0];
      } else {
        id = result;
      }

      console.log("Extracted ID:", id);

      if (!id || isNaN(id)) {
        throw new Error("Failed to get valid prescription ID from database");
      }

      return this.findById(parseInt(id));
    } catch (error) {
      console.error("Error in Prescription.create:", error);
      throw error;
    }
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

  // Cursor-based pagination for better performance at scale
  static async findAllCursor(filters = {}, cursor = null, limit = 20) {
    const safeLimit = Math.min(limit, 100);

    const query = db("prescriptions")
      .select(
        "id",
        "patientId",
        "doctorId",
        "date",
        "diagnosis",
        "status",
        "createdAt"
      )
      .orderBy("createdAt", "desc")
      .orderBy("id", "desc"); // Secondary sort for consistency

    // Apply filters
    if (filters.patientId) query.where({ patientId: filters.patientId });
    if (filters.doctorId) query.where({ doctorId: filters.doctorId });
    if (filters.status) query.where({ status: filters.status });
    if (filters.dateFrom) query.where("date", ">=", filters.dateFrom);
    if (filters.dateTo) query.where("date", "<=", filters.dateTo);

    // Apply cursor for pagination
    if (cursor) {
      const [timestamp, id] = cursor.split("_");
      query.where(function () {
        this.where("createdAt", "<", timestamp).orWhere(function () {
          this.where("createdAt", "=", timestamp).andWhere(
            "id",
            "<",
            parseInt(id)
          );
        });
      });
    }

    query.limit(safeLimit + 1); // Fetch one extra to check if there are more results

    const prescriptions = await query;
    const hasMore = prescriptions.length > safeLimit;

    if (hasMore) {
      prescriptions.pop(); // Remove the extra record
    }

    // Generate next cursor
    let nextCursor = null;
    if (hasMore && prescriptions.length > 0) {
      const lastRecord = prescriptions[prescriptions.length - 1];
      nextCursor = `${lastRecord.createdAt.toISOString()}_${lastRecord.id}`;
    }

    return {
      data: prescriptions.map((prescription) =>
        this.parsePrescriptionData(prescription)
      ),
      nextCursor,
      hasMore,
    };
  }

  // Optimized patient search with full-text capabilities
  static async searchPatients(searchTerm, limit = 10) {
    const safeLimit = Math.min(limit, 50);

    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const term = searchTerm.trim().toLowerCase();

    const query = db("patients")
      .select(
        "patientId",
        "firstName",
        "lastName",
        "cnic",
        "contact",
        "dateOfBirth"
      )
      .where(function () {
        this.whereRaw("LOWER(firstName) LIKE ?", [`%${term}%`])
          .orWhereRaw("LOWER(lastName) LIKE ?", [`%${term}%`])
          .orWhereRaw("LOWER(CONCAT(firstName, ' ', lastName)) LIKE ?", [
            `%${term}%`,
          ])
          .orWhere("cnic", "LIKE", `%${term}%`)
          .orWhere("contact", "LIKE", `%${term}%`)
          .orWhere("patientId", "LIKE", `%${term}%`);
      })
      .orderBy("firstName")
      .limit(safeLimit);

    return await query;
  }
}

export default Prescription;
