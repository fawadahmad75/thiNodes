import express from "express";
import {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
  generatePrescriptionPDF,
} from "../controllers/prescription.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Prescription routes
router.get("/", getAllPrescriptions);
router.get("/:id", getPrescriptionById);
router.get("/:id/pdf", generatePrescriptionPDF);
router.post("/", createPrescription);
router.put("/:id", updatePrescription);
router.delete("/:id", deletePrescription);

export default router;
