import express from "express";
import { isAuthenticated } from "../../middlewares/sessionAuth.js";
import {
  showDepartmentSelection,
  selectDepartment,
} from "../../controllers/views/department.controller.js";

const router = express.Router();

// Department selection routes
router.get("/select", isAuthenticated, showDepartmentSelection);
router.post("/select", isAuthenticated, selectDepartment);

export default router;
