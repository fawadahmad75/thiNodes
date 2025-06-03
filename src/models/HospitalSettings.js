import db from "../db/index.js";

// HospitalSettings model
class HospitalSettings {
  // Get the hospital settings (should be only one record)
  static async get() {
    return db("hospital_settings").first();
  }

  // Update hospital settings
  static async update(settingsData) {
    settingsData.updatedAt = db.fn.now();
    await db("hospital_settings").update(settingsData);
    return this.get();
  }

  // Reset hospital settings to default
  static async resetToDefault() {
    await db("hospital_settings").delete();

    // Re-insert default settings
    await db("hospital_settings").insert({
      hospitalName: "General Hospital",
      address: "123 Main Street, City",
      phone: "+1-234-567-8900",
      email: "info@hospital.com",
      website: "www.hospital.com",
      headerText: "Providing Quality Healthcare",
      footerText: "© 2025 General Hospital. All rights reserved.",
      createdAt: db.fn.now(),
      updatedAt: db.fn.now(),
    });

    return this.get();
  }
}

export default HospitalSettings;
