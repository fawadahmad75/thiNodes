import express from "express";
import {
  getHospitalSettings,
  updateHospitalSettings,
  resetHospitalSettings,
  getPrintSettings,
  updatePrintSettings,
  resetPrintSettings,
} from "../controllers/settings.controller.js";
import { authenticate, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Hospital settings routes
router.get("/hospital", getHospitalSettings);
router.put("/hospital", isAdmin, updateHospitalSettings);
router.post("/hospital/reset", isAdmin, resetHospitalSettings);

// Print settings routes
router.get("/print", getPrintSettings);
router.put("/print", isAdmin, updatePrintSettings);
router.post("/print/reset", isAdmin, resetPrintSettings);

export default router;
