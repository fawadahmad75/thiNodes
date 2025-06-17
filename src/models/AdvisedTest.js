import db from "../db/index.js";

// AdvisedTest model
class AdvisedTest {
  // Get all advised tests for a prescription
  static async findByPrescriptionId(prescriptionId) {
    return db("advised_tests_in_prescription")
      .select("*")
      .where({ prescriptionId })
      .orderBy("id");
  }

  // Find advised test by ID
  static async findById(id) {
    return db("advised_tests_in_prescription").where({ id }).first();
  }

  // Create new advised test
  static async create(testData) {
    const [result] = await db("advised_tests_in_prescription")
      .insert(testData)
      .returning("id");
    const id = result.id || result;
    return this.findById(id);
  }

  // Update advised test
  static async update(id, testData) {
    testData.updatedAt = db.fn.now();
    await db("advised_tests_in_prescription").where({ id }).update(testData);
    return this.findById(id);
  }

  // Delete advised test
  static async delete(id) {
    return db("advised_tests_in_prescription").where({ id }).del();
  }

  // Delete all tests from a prescription
  static async deleteByPrescriptionId(prescriptionId) {
    return db("advised_tests_in_prescription").where({ prescriptionId }).del();
  }

  // Batch create multiple tests for a prescription
  static async createMany(tests) {
    if (!tests || tests.length === 0) return [];

    // Make sure all tests have the same prescriptionId
    const prescriptionId = tests[0].prescriptionId;

    // Set timestamps for all entries
    const now = new Date();
    const timestampedTests = tests.map((test) => ({
      ...test,
      createdAt: now,
      updatedAt: now,
    }));

    // Batch insert and return IDs
    const ids = await db("advised_tests_in_prescription")
      .insert(timestampedTests)
      .returning("id");

    // Return all inserted tests
    return db("advised_tests_in_prescription")
      .select("*")
      .whereIn("id", ids)
      .orderBy("id");
  }
}

export default AdvisedTest;
