import { Router } from "express";
import FormularyViewController from "../../controllers/views/formulary.controller.js";
import { isAuthenticated, isAdmin } from "../../middlewares/sessionAuth.js";
import multer from "multer";

// Configure multer for CSV uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

const router = Router();
const controller = new FormularyViewController();

// List all medicines
router.get("/", isAuthenticated, controller.index.bind(controller));

// Export medicines to CSV
router.get("/export", isAuthenticated, controller.export.bind(controller));

// Download CSV template
router.get(
  "/template",
  isAuthenticated,
  controller.downloadTemplate.bind(controller)
);

// Form for adding new medicine
router.get("/new", isAdmin, controller.new.bind(controller));

// Import medicines from CSV
router.post(
  "/import",
  isAdmin,
  upload.single("file"),
  controller.import.bind(controller)
);

// Handle form submissions
router.post("/", isAdmin, controller.create.bind(controller));

// Delete medicine (method-override will send DELETE)
router.delete("/delete", isAdmin, controller.delete.bind(controller));

// Show individual medicine details
router.get("/:id", isAuthenticated, controller.show.bind(controller));

// Form for editing medicine
router.get("/:id/edit", isAdmin, controller.edit.bind(controller));

// Use PUT for updating existing medicines (with method-override)
router.put("/:id", isAdmin, controller.update.bind(controller));
// Also support POST for updates (to handle cases where method-override doesn't work)
router.post("/:id", isAdmin, controller.update.bind(controller));

export default router;
