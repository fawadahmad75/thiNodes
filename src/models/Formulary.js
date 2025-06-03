import db from "../db/index.js";

// Formulary model
class Formulary {
  // Class fields for validation
  static get jsonFields() {
    return ["frequencyOptions", "drugInteractions", "sideEffects"];
  }

  static get validCategories() {
    return [
      "tablet",
      "injection",
      "insulin injection",
      "capsule",
      "solution",
      "syrup",
      "inhaler",
      "suspension",
      "soft capsule",
      "drops",
      "effervescent tablet",
      "sachet powder",
      "gel",
      "nebulising solution",
      "powder",
      "cream",
      "ointment",
      "emulsion",
      "rotcaps",
      "device",
    ];
  }

  // Get all medicines with search, filters and pagination
  static async search({
    search = "",
    category = "",
    sort = "name_asc",
    page = 1,
    limit = 10,
  }) {
    // Start building query
    let query = db("formulary");

    // Apply search if provided
    if (search) {
      query = query.where((builder) => {
        builder
          .whereILike("name", `%${search}%`)
          .orWhereILike("genericName", `%${search}%`);
      });
    }

    // Apply category filter
    if (category) {
      query = query.where("category", category);
    }

    // Apply sorting
    switch (sort) {
      case "name_desc":
        query = query.orderBy("name", "desc");
        break;
      case "created_desc":
        query = query.orderBy("createdAt", "desc");
        break;
      case "created_asc":
        query = query.orderBy("createdAt", "asc");
        break;
      default: // name_asc
        query = query.orderBy("name", "asc");
    }

    // Get total count for pagination
    const total = await query.clone().count().first();

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    // Get paginated data
    const data = await query;

    return {
      data,
      total: parseInt(total?.count || "0"),
    };
  }

  // Find medicine by ID
  static async findById(id) {
    return db("formulary").where({ id }).first();
  }

  // Create new medicine
  static async create(medicineData) {
    // Parse JSON fields
    for (const field of this.jsonFields) {
      if (medicineData[field]) {
        medicineData[field] = JSON.stringify(
          Array.isArray(medicineData[field])
            ? medicineData[field]
            : medicineData[field].split(",").map((item) => item.trim())
        );
      }
    }

    // Set timestamps
    medicineData.createdAt = medicineData.updatedAt = db.fn.now();

    const [id] = await db("formulary").insert(medicineData).returning("id");
    return this.findById(id);
  }

  // Update medicine
  static async update(id, medicineData) {
    // Parse JSON fields
    for (const field of this.jsonFields) {
      if (medicineData[field]) {
        medicineData[field] = JSON.stringify(
          Array.isArray(medicineData[field])
            ? medicineData[field]
            : medicineData[field].split(",").map((item) => item.trim())
        );
      }
    }

    medicineData.updatedAt = db.fn.now();
    await db("formulary").where({ id }).update(medicineData);
    return this.findById(id);
  }

  // Delete medicine
  static async delete(id) {
    return db("formulary").where({ id }).del();
  }

  // Import medicines from CSV data
  static async importFromCsv(data) {
    let success = 0;
    const failed = [];

    for (const row of data) {
      try {
        // Prepare the medicine data
        const medicine = {
          name: row.name,
          genericName: row.genericName || null,
          category: row.category,
          strength: row.strength,
          frequencyOptions: row.frequencyOptions
            ? JSON.stringify(
                row.frequencyOptions.split(",").map((f) => f.trim())
              )
            : "[]",
          drugInteractions: row.drugInteractions
            ? JSON.stringify(
                row.drugInteractions.split(",").map((d) => d.trim())
              )
            : "[]",
          sideEffects: row.sideEffects
            ? JSON.stringify(row.sideEffects.split(",").map((s) => s.trim()))
            : "[]",
          dosageGuidelines: row.dosageGuidelines || null,
        };

        // Insert the medicine
        await this.create(medicine);
        success++;
      } catch (error) {
        failed.push({
          row,
          error: error.message,
        });
      }
    }

    return { success, failed };
  }

  // Export medicines to CSV format
  static async exportToCsv() {
    const medicines = await db("formulary");

    return medicines.map((medicine) => ({
      name: medicine.name,
      genericName: medicine.genericName || "",
      category: medicine.category,
      strength: medicine.strength,
      frequencyOptions: JSON.parse(medicine.frequencyOptions || "[]").join(
        ", "
      ),
      drugInteractions: JSON.parse(medicine.drugInteractions || "[]").join(
        ", "
      ),
      sideEffects: JSON.parse(medicine.sideEffects || "[]").join(", "),
      dosageGuidelines: medicine.dosageGuidelines || "",
    }));
  }
}

export default Formulary;
