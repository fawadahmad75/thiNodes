import db from "../db/index.js";

// PrintSettings model
class PrintSettings {
  // Get the print settings (should be only one record)
  static async get() {
    return db("print_settings").first();
  }

  // Update print settings
  static async update(settingsData) {
    settingsData.updatedAt = db.fn.now();
    await db("print_settings").update(settingsData);
    return this.get();
  }

  // Reset print settings to default
  static async resetToDefault() {
    await db("print_settings").delete();

    // Re-insert default settings
    await db("print_settings").insert({
      headerText: "Hospital Prescription",
      footerText: "Thank you for visiting our hospital",
      showLogo: true,
      showDoctorInfo: true,
      showPatientId: true,
      fontSize: "medium",
      paperSize: "a4",
      createdAt: db.fn.now(),
      updatedAt: db.fn.now(),
    });

    return this.get();
  }
}

export default PrintSettings;
