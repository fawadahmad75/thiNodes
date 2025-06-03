import express from "express";
import {
  getAllTestResults,
  getTestResultById,
  getTestResultsByPatientId,
  createTestResult,
  updateTestResult,
  deleteTestResult,
} from "../controllers/testResult.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Test results routes
router.get("/", getAllTestResults);
router.get("/:id", getTestResultById);
router.get("/patient/:patientId", getTestResultsByPatientId);
router.post("/", createTestResult);
router.put("/:id", updateTestResult);
router.delete("/:id", deleteTestResult);

export default router;
