import express from "express";
import {
  getAllPatients,
  searchPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patient.controller.js";
import { getPrescriptionsByPatientId } from "../controllers/prescription.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Patient routes
router.get("/", getAllPatients);
router.get("/search", searchPatients);
router.get("/:id", getPatientById);
router.get(
  "/:id/prescriptions",
  (req, res, next) => {
    // Pass the patientId from URL params to the controller
    req.params.patientId = req.params.id;
    next();
  },
  getPrescriptionsByPatientId
);
router.post("/", createPatient);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);

export default router;
