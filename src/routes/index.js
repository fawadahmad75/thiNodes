import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import patientRoutes from "./patientRoutes.js";
import prescriptionRoutes from "./prescriptionRoutes.js";
import formularyRoutes from "./formularyRoutes.js";
import testResultRoutes from "./testResultRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import viewRoutes from "./viewRoutes.js";

const router = express.Router();

// View routes (must be before API routes to handle /* path)
router.use("/", viewRoutes);

// API routes
router.use("/api/auth", authRoutes);
router.use("/api/users", userRoutes);
router.use("/api/patients", patientRoutes);
router.use("/api/prescriptions", prescriptionRoutes);
router.use("/api/formulary", formularyRoutes);
router.use("/api/test-results", testResultRoutes);
router.use("/api/settings", settingsRoutes);

// Redirect root to dashboard or login
router.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/auth/login");
  }
});

export default router;
