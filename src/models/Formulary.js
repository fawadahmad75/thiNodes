import db from "../db/index.js";
import cache from "../utils/cache.js";

// Formulary model
class Formulary {
  // Class fields for validation
  static get arrayFields() {
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
    } // Create a clone for counting before applying sorting
    const countQuery = query.clone();

    // Get total count for pagination (without sort)
    const total = await countQuery.count("* as count").first();

    // Apply sorting to the main query
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

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset); // Get paginated data
    const data = await query;

    return {
      data,
      total: parseInt(total?.count || "0"),
    };
  }
  // Find medicine by ID
  static async findById(id) {
    // Convert id to integer if it's a string or JSON
    let medicineId = id;
    if (typeof id === "string") {
      try {
        // Check if id is a JSON string
        if (id.startsWith("{") && id.endsWith("}")) {
          const parsed = JSON.parse(id);
          medicineId = parsed.id || id;
        }
        // Ensure the ID is converted to a number
        medicineId = parseInt(medicineId, 10);
      } catch (error) {
        console.error("Error parsing medicine ID:", error);
        // If parsing fails, try using the original id
        medicineId = parseInt(id, 10);
      }
    }
    return db("formulary").where({ id: medicineId }).first();
  }

  // Get all medicines (cached for performance)
  static async findAll(limit = 1000) {
    const cacheKey = `formulary:all:${limit}`;

    return await cache.getOrSet(
      cacheKey,
      async () => {
        return db("formulary")
          .select(
            "id",
            "name",
            "strength",
            "category",
            "genericName",
            "frequencyOptions",
            "dosageGuidelines"
          ) // Select only existing fields
          .orderBy("name", "asc")
          .limit(limit);
      },
      10 * 60 * 1000
    ); // Cache for 10 minutes
  }

  // Create new medicine
  static async create(medicineData) {
    // Process array fields
    for (const field of this.arrayFields) {
      // Handle arrays that come from form with name like fieldName[]
      if (field + "[]" in medicineData) {
        let values = medicineData[field + "[]"];
        if (!Array.isArray(values)) values = [values];
        medicineData[field] = values.filter(Boolean);
        delete medicineData[field + "[]"];
      } else if (medicineData[field]) {
        let values = medicineData[field];
        if (typeof values === "string") {
          // Try to parse as JSON array, fallback to splitting or wrapping
          let arr;
          try {
            arr = JSON.parse(values);
            if (!Array.isArray(arr)) arr = [values.trim()];
          } catch {
            if (values.includes(",")) {
              arr = values
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
            } else {
              arr = [values.trim()];
            }
          }
          medicineData[field] = arr;
        } else if (Array.isArray(values)) {
          medicineData[field] = values.filter(Boolean);
        }
      } else {
        medicineData[field] = [];
      }
    }
    // Set timestamps
    medicineData.createdAt = medicineData.updatedAt = db.fn.now();
    const [id] = await db("formulary").insert(medicineData).returning("id");
    return { id };
  }
  // Update medicine
  static async update(id, medicineData) {
    const medicineId = typeof id === "string" ? parseInt(id, 10) : id;
    if (isNaN(medicineId)) {
      throw new Error("Invalid medicine ID format");
    }
    for (const field of this.arrayFields) {
      if (field + "[]" in medicineData) {
        let values = medicineData[field + "[]"];
        if (!Array.isArray(values)) values = [values];
        medicineData[field] = values.filter(Boolean);
        delete medicineData[field + "[]"];
      } else if (medicineData[field]) {
        let values = medicineData[field];
        if (typeof values === "string") {
          let arr;
          try {
            arr = JSON.parse(values);
            if (!Array.isArray(arr)) arr = [values.trim()];
          } catch {
            if (values.includes(",")) {
              arr = values
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
            } else {
              arr = [values.trim()];
            }
          }
          medicineData[field] = arr;
        } else if (Array.isArray(values)) {
          medicineData[field] = values.filter(Boolean);
        }
      } else {
        medicineData[field] = [];
      }
    }
    medicineData.updatedAt = db.fn.now();
    await db("formulary").where({ id: medicineId }).update(medicineData);
    return { id: medicineId };
  }
  // Delete medicine
  static async delete(id) {
    // Ensure id is a number
    const medicineId = typeof id === "string" ? parseInt(id, 10) : id;
    if (isNaN(medicineId)) {
      throw new Error("Invalid medicine ID format");
    }

    return db("formulary").where({ id: medicineId }).del();
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
            ? row.frequencyOptions.split(",").map((f) => f.trim())
            : [],
          drugInteractions: row.drugInteractions
            ? row.drugInteractions.split(",").map((d) => d.trim())
            : [],
          sideEffects: row.sideEffects
            ? row.sideEffects.split(",").map((s) => s.trim())
            : [],
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
      frequencyOptions: Array.isArray(medicine.frequencyOptions)
        ? medicine.frequencyOptions.join(", ")
        : "",
      drugInteractions: Array.isArray(medicine.drugInteractions)
        ? medicine.drugInteractions.join(", ")
        : "",
      sideEffects: Array.isArray(medicine.sideEffects)
        ? medicine.sideEffects.join(", ")
        : "",
      dosageGuidelines: medicine.dosageGuidelines || "",
    }));
  }
}

export default Formulary;
