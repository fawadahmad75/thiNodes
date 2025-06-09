import { Formulary } from "../../models/index.js";
import { validateCSV } from "../../utils/csvValidator.js";
import createCsvStringifier from "csv-writer";

class FormularyViewController {
  // Show index page with list of medicines
  async index(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      const category = req.query.category || "";
      const sort = req.query.sort || "name_asc";

      const { data: medicines, total } = await Formulary.search({
        search,
        category,
        sort,
        page,
        limit,
      });
      const totalPages = Math.ceil(total / limit);
      const successMessage = req.session.successMessage;
      const errorMessage = req.session.errorMessage;
      delete req.session.successMessage;
      delete req.session.errorMessage;

      res.render("formulary/index", {
        title: "Medicine Formulary",
        active: "formulary",
        medicines,
        currentPage: page,
        totalPages,
        successMessage,
        errorMessage,
        query: {
          search,
          category,
          sort,
          toString: () =>
            Object.entries({ search, category, sort })
              .filter(([_, v]) => v)
              .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
              .join("&"),
        },
      });
    } catch (error) {
      console.error("Error in formulary index:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to load medicines",
      });
    }
  }

  // Show form to add new medicine
  async new(req, res) {
    res.render("formulary/form", {
      title: "Add Medicine",
      active: "formulary",
      medicine: null,
    });
  }
  // Show form to edit medicine
  async edit(req, res) {
    try {
      // Parse ID to ensure it's an integer
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.render("errors/404", {
          title: "Invalid ID",
          message: "Invalid medicine ID format",
        });
      }

      const medicine = await Formulary.findById(id);
      if (!medicine) {
        return res.render("errors/404", {
          title: "Not Found",
          message: "Medicine not found",
        });
      } // Ensure array fields are always arrays for the form
      for (const field of Formulary.arrayFields) {
        try {
          if (typeof medicine[field] === "string") {
            medicine[field] = JSON.parse(medicine[field] || "[]");
          } else if (!Array.isArray(medicine[field])) {
            medicine[field] = [];
          }
        } catch (e) {
          medicine[field] = [];
        }
      }
      res.render("formulary/form", {
        title: "Edit Medicine",
        active: "formulary",
        medicine,
      });
    } catch (error) {
      console.error("Error in edit medicine:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to load medicine",
      });
    }
  } // Create new medicine
  async create(req, res) {
    try {
      // Create a copy of req.body without the _method field (if it exists)
      const { _method, ...medicineData } = req.body;

      // Pass the cleaned data to the model - will handle arrays with [] notation
      const medicine = await Formulary.create(medicineData);

      // Redirect to formulary list with success message
      req.session.successMessage = "Medicine added successfully";
      res.redirect("/formulary");
    } catch (error) {
      console.error("Error creating medicine:", error); // Return to form with error - ensure array fields are properly handled
      // Remove _method field to avoid it being included in form data
      const { _method, ...cleanedData } = req.body;
      const formData = { ...cleanedData };

      // Make sure array fields are properly handled
      for (const field of Formulary.arrayFields) {
        const fieldArrayName = field + "[]";
        if (fieldArrayName in formData) {
          // Handle array values from form
          const values = Array.isArray(formData[fieldArrayName])
            ? formData[fieldArrayName]
            : [formData[fieldArrayName]];
          formData[field] = values.filter(Boolean);
          delete formData[fieldArrayName];
        } else if (formData[field] && !Array.isArray(formData[field])) {
          // If it's not an array, wrap it in an array
          formData[field] = [formData[field]];
        }
      }

      res.render("formulary/form", {
        title: "Add Medicine",
        active: "formulary",
        medicine: formData,
        error: error.message,
      });
    }
  } // Update existing medicine
  async update(req, res) {
    try {
      // Parse ID to ensure it's an integer, handling possible JSON string
      let id = req.params.id;

      // Check if id might be a JSON string
      if (typeof id === "string" && id.startsWith("{") && id.endsWith("}")) {
        try {
          const parsed = JSON.parse(id);
          id = parsed.id || id;
        } catch (e) {
          console.error("Error parsing ID as JSON:", e);
        }
      }

      // Convert to integer
      id = parseInt(id, 10);

      if (isNaN(id)) {
        throw new Error("Invalid medicine ID format");
      }
      console.log("Processing update for medicine ID:", id);

      // Create a copy of req.body without the _method field
      const { _method, ...medicineData } = req.body;

      // Pass the cleaned data to the model - will handle arrays with [] notation
      await Formulary.update(id, medicineData);

      // Redirect to formulary list with success message
      req.session.successMessage = "Medicine updated successfully";
      res.redirect("/formulary");
    } catch (error) {
      console.error("Error updating medicine:", error);
      // Return to form with error - ensure array fields are properly handled
      // Remove _method field to avoid it being included in form data
      const { _method, ...cleanedData } = req.body;
      const formData = {
        ...cleanedData,
        id: parseInt(req.params.id, 10) || req.params.id,
      };

      // Make sure array fields are properly handled
      for (const field of Formulary.arrayFields) {
        const fieldArrayName = field + "[]";
        if (fieldArrayName in formData) {
          // Handle array values from form
          const values = Array.isArray(formData[fieldArrayName])
            ? formData[fieldArrayName]
            : [formData[fieldArrayName]];
          formData[field] = values.filter(Boolean);
          delete formData[fieldArrayName];
        } else if (formData[field] && !Array.isArray(formData[field])) {
          // If it's not an array, wrap it in an array
          formData[field] = [formData[field]];
        }
      }

      res.render("formulary/form", {
        title: "Edit Medicine",
        active: "formulary",
        medicine: formData,
        error: error.message,
      });
    }
  } // Delete medicine
  async delete(req, res) {
    try {
      const id = parseInt(req.body.id, 10);
      if (isNaN(id)) {
        throw new Error("Invalid medicine ID format");
      }
      await Formulary.delete(id);
      // If AJAX, send JSON; else, redirect
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.json({
          success: true,
          message: "Medicine deleted successfully",
        });
      }
      req.session.successMessage = "Medicine deleted successfully";
      res.redirect("/formulary");
    } catch (error) {
      console.error("Error deleting medicine:", error);
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(400).json({ success: false, message: error.message });
      }
      req.session.successMessage = undefined;
      res.render("errors/error", {
        title: "Error",
        message: "Failed to delete medicine: " + error.message,
      });
    }
  }

  // Export medicines to CSV
  async export(req, res) {
    try {
      const data = await Formulary.exportToCsv();

      const csvStringifier = createCsvStringifier.createObjectCsvStringifier({
        header: [
          { id: "name", title: "Name" },
          { id: "genericName", title: "Generic Name" },
          { id: "category", title: "Category" },
          { id: "strength", title: "Strength" },
          { id: "frequencyOptions", title: "Frequency Options" },
          { id: "drugInteractions", title: "Drug Interactions" },
          { id: "sideEffects", title: "Side Effects" },
          { id: "dosageGuidelines", title: "Dosage Guidelines" },
        ],
      });

      const csvString =
        csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(data);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="medicines.csv"'
      );
      res.send(csvString);
    } catch (error) {
      console.error("Error exporting medicines:", error);
      req.session.successMessage = undefined;
      res.render("errors/error", {
        title: "Error",
        message: "Failed to export medicines: " + error.message,
      });
    }
  }

  // Import medicines from CSV
  async import(req, res) {
    try {
      if (!req.file) {
        req.session.successMessage = undefined;
        req.session.errorMessage = "Please upload a CSV file";
        return res.redirect("/formulary");
      }

      const csvData = req.file.buffer.toString();
      const { data, errors } = await validateCSV(csvData);

      if (errors.length > 0) {
        req.session.successMessage = undefined;
        req.session.errorMessage = "Invalid CSV format: " + errors.join(", ");
        return res.redirect("/formulary");
      }

      const result = await Formulary.importFromCsv(data);

      if (result.failed.length > 0) {
        req.session.successMessage = `Imported ${result.success} medicines. Failed to import ${result.failed.length} medicines: ${result.failed
          .map((f) => f.error)
          .slice(0, 3)
          .join(", ")}${result.failed.length > 3 ? "..." : ""}`;
      } else {
        req.session.successMessage = `Successfully imported ${result.success} medicines`;
      }

      res.redirect("/formulary");
    } catch (error) {
      console.error("Error importing medicines:", error);
      req.session.successMessage = undefined;
      req.session.errorMessage = "Failed to import medicines: " + error.message;
      res.redirect("/formulary");
    }
  }

  // Download CSV template
  async downloadTemplate(req, res) {
    try {
      const csvStringifier = createCsvStringifier.createObjectCsvStringifier({
        header: [
          { id: "name", title: "Name" },
          { id: "genericName", title: "Generic Name" },
          { id: "category", title: "Category" },
          { id: "strength", title: "Strength" },
          { id: "frequencyOptions", title: "Frequency Options" },
          { id: "drugInteractions", title: "Drug Interactions" },
          { id: "sideEffects", title: "Side Effects" },
          { id: "dosageGuidelines", title: "Dosage Guidelines" },
        ],
      });

      const sampleData = [
        {
          name: "Paracetamol",
          genericName: "Acetaminophen",
          category: "tablet",
          strength: "500mg",
          frequencyOptions: "Once daily, Twice daily, Three times daily",
          drugInteractions: "Warfarin, Alcohol",
          sideEffects: "Nausea, Liver damage in high doses",
          dosageGuidelines: "Take with or without food. Maximum 4g per day.",
        },
      ];

      const csvString =
        csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(sampleData);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="medicines_template.csv"'
      );
      res.send(csvString);
    } catch (error) {
      console.error("Error generating template:", error);
      req.session.successMessage = undefined;
      res.render("errors/error", {
        title: "Error",
        message: "Failed to generate template: " + error.message,
      });
    }
  }
}

export default FormularyViewController;
