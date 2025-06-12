import db from "../db/index.js";

// Department model
class Department {
  // Get all departments with optional filters
  static async findAll(filters = {}, page = 1, limit = 10) {
    const query = db("departments").select("*");

    // Apply filters if provided
    if (filters.name) query.where("name", "like", `%${filters.name}%`);
    if (filters.description) query.where("description", "like", `%${filters.description}%`);

    // Apply pagination
    const offset = (page - 1) * limit;
    query.offset(offset).limit(limit);

    return query;
  }

  // Find department by ID
  static async findById(id) {
    return db("departments").where({ id }).first();
  }

  // Find department by name
  static async findByName(name) {
    return db("departments").where({ name }).first();
  }

  // Create new department
  static async create(departmentData) {
    const [id] = await db("departments").insert(departmentData).returning("id");
    return this.findById(id);
  }

  // Update department
  static async update(id, departmentData) {
    departmentData.updatedAt = db.fn.now();
    await db("departments").where({ id }).update(departmentData);
    return this.findById(id);
  }

  // Delete department
  static async delete(id) {
    return db("departments").where({ id }).del();
  }

  // Get department count
  static async count(filters = {}) {
    const query = db("departments").count("id as count");
    
    if (filters.name) query.where("name", "like", `%${filters.name}%`);
    if (filters.description) query.where("description", "like", `%${filters.description}%`);
    
    const result = await query.first();
    return parseInt(result.count);
  }
}

export default Department;
