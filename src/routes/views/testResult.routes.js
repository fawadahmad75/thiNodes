import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import TestResultViewController from "../../controllers/views/testResult.controller.js";

const router = express.Router();
const controller = new TestResultViewController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads", "test-results");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
      );
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, JPEG, and PNG files are allowed."
        )
      );
    }
  },
});

// Test result view routes
router.get("/", controller.index.bind(controller));
router.get("/new", controller.new.bind(controller));
router.get("/:id", controller.show.bind(controller));
router.get("/:id/edit", controller.edit.bind(controller));
router.get("/:id/download", controller.download.bind(controller));

// Form submission routes with file upload
router.post("/", upload.single("file"), controller.create.bind(controller));
router.post("/:id", upload.single("file"), controller.update.bind(controller)); // Using POST with _method for PUT
router.post("/:id/delete", controller.delete.bind(controller)); // Using POST with _method for DELETE

export default router;
