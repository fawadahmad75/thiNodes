import express from "express";
import PrescriptionViewController from "../../controllers/views/prescription.controller.js";

const router = express.Router();
const controller = new PrescriptionViewController();

// Prescription view routes
router.get("/", controller.index.bind(controller));
router.get("/new", controller.new.bind(controller));
router.get("/:id", controller.show.bind(controller));
router.get("/:id/edit", controller.edit.bind(controller));
router.get("/:id/pdf", controller.generatePDF.bind(controller));

// Form submission routes
router.post("/", controller.create.bind(controller));
router.post("/:id", controller.update.bind(controller)); // Using POST with _method for PUT
router.post("/:id/delete", controller.delete.bind(controller)); // Using POST with _method for DELETE

export default router;
