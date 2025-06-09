import express from "express";
import SettingsViewController from "../../controllers/views/settings.controller.js";
import { isAdmin } from "../../middlewares/sessionAuth.js";

const router = express.Router();
const controller = new SettingsViewController();

// All settings routes require admin privileges
router.use(isAdmin);

// Settings view routes
router.get("/", controller.index.bind(controller));
router.get("/hospital", controller.hospitalSettings.bind(controller));
router.get("/print", controller.printSettings.bind(controller));

// Form submission routes
router.post("/hospital", controller.updateHospitalSettings.bind(controller));
router.post("/print", controller.updatePrintSettings.bind(controller));

export default router;
