import db from "../db/index.js";

// TestResult model
class TestResult {
  // Get all test results with optional filters
  static async findAll(filters = {}, page = 1, limit = 10) {
    const query = db("test_results").select("*");

    // Apply filters if provided
    if (filters.patientId) query.where({ patientId: filters.patientId });
    if (filters.doctorId) query.where({ doctorId: filters.doctorId });
    if (filters.advisedTestId)
      query.where({ advisedTestId: filters.advisedTestId });
    if (filters.testName)
      query.where("testName", "like", `%${filters.testName}%`);
    if (filters.dateFrom) query.where("testDate", ">=", filters.dateFrom);
    if (filters.dateTo) query.where("testDate", "<=", filters.dateTo);

    // Apply pagination
    const offset = (page - 1) * limit;
    query.offset(offset).limit(limit);

    return query;
  }

  // Find test result by ID
  static async findById(id) {
    return db("test_results").where({ id }).first();
  }
  // Find test results by patient ID (patientId is now a string from Oracle)
  static async findByPatientId(patientId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return db("test_results")
      .select("*")
      .where({ patientId }) // patientId is now a string, not an integer
      .orderBy("testDate", "desc")
      .offset(offset)
      .limit(limit);
  }

  // Find test results by advised test ID
  static async findByAdvisedTestId(advisedTestId) {
    return db("test_results")
      .select("*")
      .where({ advisedTestId })
      .orderBy("testDate", "desc");
  }

  // Create new test result
  static async create(resultData) {
    const [id] = await db("test_results").insert(resultData).returning("id");
    return this.findById(id);
  }

  // Update test result
  static async update(id, resultData) {
    resultData.updatedAt = db.fn.now();
    await db("test_results").where({ id }).update(resultData);
    return this.findById(id);
  }

  // Delete test result
  static async delete(id) {
    return db("test_results").where({ id }).del();
  }
}

export default TestResult;
