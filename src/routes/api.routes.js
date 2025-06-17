import express from "express";
import { Patient, MedicalHistory } from "../models/index.js";

const router = express.Router();

// Get patient by ID
router.get("/patients/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    // Find patient
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Get medical history if exists
    const medicalHistory = await MedicalHistory.findByPatientId(patientId);

    res.json({
      success: true,
      patient,
      medicalHistory,
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching patient data",
    });
  }
});

export default router;
