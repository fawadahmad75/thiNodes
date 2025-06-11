import express from "express";
import PatientViewController from "../../controllers/views/patient.controller.js";

const router = express.Router();
const controller = new PatientViewController();

// Patient view routes
router.get("/", controller.index.bind(controller));
router.get("/new", controller.new.bind(controller));
router.get("/:id/edit", controller.edit.bind(controller));
router.get("/:id", controller.show.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));

export default router;
