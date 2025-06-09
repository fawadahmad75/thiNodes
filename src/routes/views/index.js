import { Router } from "express";
import { isAuthenticated, isAdmin } from "../../middlewares/sessionAuth.js";
import authRoutes from "./auth.routes.js";
import patientRoutes from "./patient.routes.js";
import formularyRoutes from "./formulary.routes.js";
import prescriptionRoutes from "./prescription.routes.js";
import testResultRoutes from "./testResult.routes.js";
import settingsRoutes from "./settings.routes.js";

const router = Router();

// Import the auth controller for dashboard
import AuthViewController from "../../controllers/views/auth.controller.js";
const authController = new AuthViewController();

// Dashboard route at root level
router.get(
  "/dashboard",
  isAuthenticated,
  authController.dashboard.bind(authController)
);

// Root route - redirect to login or dashboard
router.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/auth/login");
  }
});

// Mount all view routes
router.use("/auth", authRoutes);
router.use("/patients", isAuthenticated, patientRoutes);
router.use("/formulary", isAuthenticated, formularyRoutes);
router.use("/prescriptions", isAuthenticated, prescriptionRoutes);
router.use("/test-results", isAuthenticated, testResultRoutes);
router.use("/settings", isAuthenticated, settingsRoutes);

export default router;
