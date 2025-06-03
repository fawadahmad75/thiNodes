import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { authenticate, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Protected routes
router.get("/me", authenticate, getCurrentUser);

// Admin-only routes
router.post("/register", authenticate, isAdmin, registerUser);

export default router;
