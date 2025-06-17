// Simple test script to verify prescription creation works
import { MedicineInPrescription, AdvisedTest } from "./src/models/index.js";

async function testPrescriptionCreation() {
  try {
    console.log("Testing MedicineInPrescription creation...");

    // Test medicine creation
    const medicineData = {
      prescriptionId: 1, // Assuming prescription ID 1 exists
      medicineId: 1, // Assuming medicine ID 1 exists
      medicineName: "Test Medicine",
      dosageForm: "tablet",
      strength: "500mg",
      dosage: "1 tablet",
      frequency: "twice daily",
      duration: "5 days",
      instructions: "Take after meals",
      isCustom: false,
    };

    const medicine = await MedicineInPrescription.create(medicineData);
    console.log("Medicine created successfully:", medicine);

    console.log("Testing AdvisedTest creation...");

    // Test advised test creation
    const testData = {
      prescriptionId: 1, // Assuming prescription ID 1 exists
      testName: "Blood Test",
      instructions: "Fasting required",
      when_to_do: "this_visit",
    };

    const test = await AdvisedTest.create(testData);
    console.log("Test created successfully:", test);

    console.log("All tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error.message);
    process.exit(1);
  }
}

testPrescriptionCreation();
