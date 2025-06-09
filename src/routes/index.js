import express from "express";
import viewRoutes from "./views/index.js";

const router = express.Router();

// View routes
router.use("/", viewRoutes);

// API routes have been removed and will be added back if needed in the future

export default router;
