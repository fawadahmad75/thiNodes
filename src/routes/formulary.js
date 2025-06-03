import { Router } from "express";
import FormularyController from "../controllers/FormularyController.js";
import multer from "multer";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";

const router = Router();
const controller = new FormularyController();

// Configure multer for CSV uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

// Get list of medicines with search and filters
router.get("/", isAuthenticated, controller.index.bind(controller));

// Form for adding new medicine
router.get("/new", isAdmin, controller.new.bind(controller));

// Form for editing medicine
router.get("/:id/edit", isAdmin, controller.edit.bind(controller));

// Create new medicine
router.post("/", isAdmin, controller.create.bind(controller));

// Update medicine
router.put("/:id", isAdmin, controller.update.bind(controller));

// Delete medicine
router.delete("/", isAdmin, controller.delete.bind(controller));

// Export medicines to CSV
router.get("/export", isAuthenticated, controller.export.bind(controller));

// Import medicines from CSV
router.post(
  "/import",
  isAdmin,
  upload.single("file"),
  controller.import.bind(controller)
);

// Download CSV template
router.get(
  "/template",
  isAuthenticated,
  controller.downloadTemplate.bind(controller)
);

export default router;
