import { parse } from "csv-parse/sync";

/**
 * Validate and parse CSV data for medicine import
 * @param {string} csvData CSV data string
 * @returns {Promise<{data: Array, errors: Array}>} Parsed data and validation errors
 */
export async function validateCSV(csvData) {
  const errors = [];
  let data = [];

  try {
    // Parse CSV
    const records = parse(csvData, {
      columns: true,
      skipEmptyLines: true,
      trim: true,
    });

    // Required fields for each medicine
    const requiredFields = ["name", "category", "strength"];

    // Valid categories from the formulary table
    const validCategories = [
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

    // Validate each record
    records.forEach((record, index) => {
      const rowErrors = [];

      // Check required fields
      requiredFields.forEach((field) => {
        if (!record[field]) {
          rowErrors.push(`Missing ${field}`);
        }
      });

      // Validate category if present
      if (
        record.category &&
        !validCategories.includes(record.category.toLowerCase())
      ) {
        rowErrors.push(
          `Invalid category. Must be one of: ${validCategories.join(", ")}`
        );
      }

      // Add row-level errors
      if (rowErrors.length > 0) {
        errors.push(`Row ${index + 2}: ${rowErrors.join(", ")}`);
      } else {
        // Clean and normalize the record
        data.push({
          name: record.name.trim(),
          genericName: record.genericName?.trim() || null,
          category: record.category.toLowerCase(),
          strength: record.strength.trim(),
          frequencyOptions: record.frequencyOptions?.trim() || "",
          drugInteractions: record.drugInteractions?.trim() || "",
          sideEffects: record.sideEffects?.trim() || "",
          dosageGuidelines: record.dosageGuidelines?.trim() || null,
        });
      }
    });
  } catch (error) {
    errors.push("Failed to parse CSV file: " + error.message);
  }

  return { data, errors };
}
