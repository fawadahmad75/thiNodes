import express from "express";
import viewRoutes from "./views/index.js";
import apiRoutes from "./api.routes.js";

const router = express.Router();

// View routes
router.use("/", viewRoutes);

// API routes
router.use("/api", apiRoutes);

export default router;
