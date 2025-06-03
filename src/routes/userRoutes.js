import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authenticate, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Admin-only routes
router.get("/", isAdmin, getAllUsers);
router.delete("/:id", isAdmin, deleteUser);

// Mixed routes (admin can access any, users can only access their own)
router.get("/:id", getUserById);
router.put("/:id", updateUser);

export default router;
