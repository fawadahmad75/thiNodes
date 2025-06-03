import Formulary from "../models/Formulary.js";
import { validateCSV } from "../utils/csvValidator.js";
import createCsvStringifier from "csv-writer";

class FormularyController {
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

      res.render("formulary/index", {
        medicines,
        currentPage: page,
        totalPages,
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
      req.flash("error", "Failed to load medicines");
      res.redirect("/");
    }
  }

  // Show form to add new medicine
  async new(req, res) {
    res.render("formulary/form", { medicine: null });
  }

  // Show form to edit medicine
  async edit(req, res) {
    try {
      const medicine = await Formulary.findById(req.params.id);
      if (!medicine) {
        req.flash("error", "Medicine not found");
        return res.redirect("/formulary");
      }
      res.render("formulary/form", { medicine });
    } catch (error) {
      console.error("Error in edit medicine:", error);
      req.flash("error", "Failed to load medicine");
      res.redirect("/formulary");
    }
  }

  // Create new medicine
  async create(req, res) {
    try {
      const medicine = await Formulary.create({
        ...req.body,
        frequencyOptions: req.body.frequencyOptions || [],
        drugInteractions: req.body.drugInteractions || [],
        sideEffects: req.body.sideEffects || [],
      });
      req.flash("success", "Medicine added successfully");
      res.redirect("/formulary");
    } catch (error) {
      console.error("Error creating medicine:", error);
      req.flash("error", "Failed to create medicine");
      res.render("formulary/form", {
        medicine: req.body,
        error: error.message,
      });
    }
  }

  // Update medicine
  async update(req, res) {
    try {
      const id = req.params.id;
      await Formulary.update(id, {
        ...req.body,
        frequencyOptions: req.body.frequencyOptions || [],
        drugInteractions: req.body.drugInteractions || [],
        sideEffects: req.body.sideEffects || [],
      });
      req.flash("success", "Medicine updated successfully");
      res.redirect("/formulary");
    } catch (error) {
      console.error("Error updating medicine:", error);
      req.flash("error", "Failed to update medicine");
      res.render("formulary/form", {
        medicine: { ...req.body, id: req.params.id },
        error: error.message,
      });
    }
  }

  // Delete medicine
  async delete(req, res) {
    try {
      await Formulary.delete(req.body.id);
      req.flash("success", "Medicine deleted successfully");
      res.redirect("/formulary");
    } catch (error) {
      console.error("Error deleting medicine:", error);
      req.flash("error", "Failed to delete medicine");
      res.redirect("/formulary");
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

      const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="medicines.csv"');
      res.send(csvString);
    } catch (error) {
      console.error("Error exporting medicines:", error);
      req.flash("error", "Failed to export medicines");
      res.redirect("/formulary");
    }
  }

  // Import medicines from CSV
  async import(req, res) {
    try {
      if (!req.file) {
        req.flash("error", "Please upload a CSV file");
        return res.redirect("/formulary");
      }

      const csvData = req.file.buffer.toString();
      const { data, errors } = await validateCSV(csvData);

      if (errors.length > 0) {
        req.flash("error", "Invalid CSV format: " + errors.join(", "));
        return res.redirect("/formulary");
      }

      const result = await Formulary.importFromCsv(data);

      if (result.failed.length > 0) {
        req.flash(
          "warning",
          `Imported ${result.success} medicines. Failed to import ${
            result.failed.length
          } medicines: ${result.failed
            .map((f) => f.error)
            .slice(0, 3)
            .join(", ")}${
            result.failed.length > 3 ? "..." : ""
          }`
        );
      } else {
        req.flash("success", `Successfully imported ${result.success} medicines`);
      }

      res.redirect("/formulary");
    } catch (error) {
      console.error("Error importing medicines:", error);
      req.flash("error", "Failed to import medicines");
      res.redirect("/formulary");
    }
  }

  // Download CSV template
  async downloadTemplate(req, res) {
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

    const sampleData = [{
      name: "Paracetamol",
      genericName: "Acetaminophen",
      category: "tablet",
      strength: "500mg",
      frequencyOptions: "Once daily, Twice daily, Three times daily",
      drugInteractions: "Warfarin, Alcohol",
      sideEffects: "Nausea, Liver damage in high doses",
      dosageGuidelines: "Take with or without food. Maximum 4g per day.",
    }];

    const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(sampleData);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="medicines_template.csv"');
    res.send(csvString);
  }
}

export default FormularyController;
