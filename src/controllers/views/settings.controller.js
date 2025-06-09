import { HospitalSettings, PrintSettings } from "../../models/index.js";

class SettingsViewController {
  // Show settings pages
  async index(req, res) {
    try {
      // Get both hospital and print settings
      const hospitalSettings = await HospitalSettings.findFirst();
      const printSettings = await PrintSettings.findFirst();

      res.render("settings/index", {
        title: "Settings",
        active: "settings",
        hospitalSettings,
        printSettings,
        successMessage: req.session.successMessage,
        errorMessage: req.session.errorMessage,
      });

      // Clear session messages
      delete req.session.successMessage;
      delete req.session.errorMessage;
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to load settings",
      });
    }
  }

  // Show hospital settings form
  async hospitalSettings(req, res) {
    try {
      const hospitalSettings = await HospitalSettings.findFirst();

      res.render("settings/hospital", {
        title: "Hospital Settings",
        active: "settings",
        settings: hospitalSettings,
        successMessage: req.session.successMessage,
        errorMessage: req.session.errorMessage,
      });

      // Clear session messages
      delete req.session.successMessage;
      delete req.session.errorMessage;
    } catch (error) {
      console.error("Error fetching hospital settings:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to load hospital settings",
      });
    }
  }

  // Show print settings form
  async printSettings(req, res) {
    try {
      const printSettings = await PrintSettings.findFirst();

      res.render("settings/print", {
        title: "Print Settings",
        active: "settings",
        settings: printSettings,
        successMessage: req.session.successMessage,
        errorMessage: req.session.errorMessage,
      });

      // Clear session messages
      delete req.session.successMessage;
      delete req.session.errorMessage;
    } catch (error) {
      console.error("Error fetching print settings:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to load print settings",
      });
    }
  }

  // Update hospital settings
  async updateHospitalSettings(req, res) {
    try {
      // Extract the hospital settings data from form
      const settingsData = {
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
        website: req.body.website,
        taxId: req.body.taxId,
        registrationNumber: req.body.registrationNumber,
      };

      // Find existing or create new
      const existing = await HospitalSettings.findFirst();
      if (existing) {
        await HospitalSettings.update(existing.id, settingsData);
      } else {
        await HospitalSettings.create(settingsData);
      }

      req.session.successMessage = "Hospital settings updated successfully";
      res.redirect("/settings/hospital");
    } catch (error) {
      console.error("Error updating hospital settings:", error);
      req.session.errorMessage =
        error.message || "Failed to update hospital settings";
      res.redirect("/settings/hospital");
    }
  }

  // Update print settings
  async updatePrintSettings(req, res) {
    try {
      // Extract the print settings data from form
      const settingsData = {
        pageSize: req.body.pageSize,
        orientation: req.body.orientation,
        margin: req.body.margin,
        headerHeight: req.body.headerHeight || 0,
        footerHeight: req.body.footerHeight || 0,
        showLogo: req.body.showLogo === "on",
        showPatientInfo: req.body.showPatientInfo === "on",
        showDoctorInfo: req.body.showDoctorInfo === "on",
        showHospitalInfo: req.body.showHospitalInfo === "on",
        logoPosition: req.body.logoPosition,
        header: req.body.header,
        footer: req.body.footer,
      };

      // Find existing or create new
      const existing = await PrintSettings.findFirst();
      if (existing) {
        await PrintSettings.update(existing.id, settingsData);
      } else {
        await PrintSettings.create(settingsData);
      }

      req.session.successMessage = "Print settings updated successfully";
      res.redirect("/settings/print");
    } catch (error) {
      console.error("Error updating print settings:", error);
      req.session.errorMessage =
        error.message || "Failed to update print settings";
      res.redirect("/settings/print");
    }
  }
}

export default SettingsViewController;
