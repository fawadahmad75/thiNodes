import db from "../db/index.js";

// User model
class User {
  // Get all users with optional filters
  static async findAll(filters = {}, page = 1, limit = 10) {
    const query = db("users").select("*");

    // Apply filters if provided
    if (filters.role) query.where({ role: filters.role });
    if (filters.name) query.where("name", "like", `%${filters.name}%`);
    if (filters.username) query.where({ username: filters.username });
    if (filters.specialization)
      query.where("specialization", "like", `%${filters.specialization}%`);

    // Apply pagination
    const offset = (page - 1) * limit;
    query.offset(offset).limit(limit);

    return query;
  }

  // Find user by ID
  static async findById(id) {
    return db("users").where({ id }).first();
  }

  // Find user by username
  static async findByUsername(username) {
    return db("users").where({ username }).first();
  }

  // Create new user
  static async create(userData) {
    const [id] = await db("users").insert(userData).returning("id");
    return this.findById(id);
  }

  // Update user
  static async update(id, userData) {
    userData.updatedAt = db.fn.now();
    await db("users").where({ id }).update(userData);
    return this.findById(id);
  }

  // Delete user
  static async delete(id) {
    return db("users").where({ id }).del();
  }

  // Update last login time
  static async updateLastLogin(id) {
    return db("users").where({ id }).update({
      lastLoginAt: db.fn.now(),
      updatedAt: db.fn.now(),
    });
  }
}

export default User;
