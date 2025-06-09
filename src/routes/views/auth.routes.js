import express from "express";
import AuthViewController from "../../controllers/views/auth.controller.js";
import { isNotAuthenticated } from "../../middlewares/sessionAuth.js";

const router = express.Router();
const controller = new AuthViewController();

// Auth routes
router.get("/login", isNotAuthenticated, controller.login.bind(controller));
router.post(
  "/login",
  isNotAuthenticated,
  controller.handleLogin.bind(controller)
);
router.post("/logout", controller.handleLogout.bind(controller));

// Dashboard route moved to root level

export default router;
