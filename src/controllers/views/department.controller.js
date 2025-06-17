import { Department } from "../../models/index.js";

// Show department selection page
export const showDepartmentSelection = async (req, res) => {
  try {
    // Get user's departments from session
    const user = req.session.user;
    const departmentIds = user.departments || [];

    // If user only has one department, redirect directly to that department's dashboard
    if (departmentIds.length === 1) {
      req.session.currentDepartment = departmentIds[0];
      return res.redirect("/dashboard");
    }

    // Fetch department details for display
    const userDepartments = [];
    for (const deptId of departmentIds) {
      const department = await Department.findById(deptId);
      if (department) {
        userDepartments.push(department);
      }
    }

    res.render("departments/select", {
      title: "Select Department",
      departments: userDepartments,
      user,
      layout: "layouts/main",
      active: "department-select",
    });
  } catch (error) {
    console.error("Error showing department selection:", error);
    res.status(500).render("errors/error", {
      message: "Failed to load department selection",
      error: error,
    });
  }
};

// Handle department selection
export const selectDepartment = async (req, res) => {
  try {
    const { departmentId } = req.body;

    // Validate that user can access this department
    const user = req.session.user;
    if (!user.departments.includes(parseInt(departmentId, 10))) {
      return res.status(403).render("errors/error", {
        message: "You don't have access to this department",
      });
    }

    // Store selected department in session
    req.session.currentDepartment = parseInt(departmentId, 10);

    // Redirect to dashboard
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error selecting department:", error);
    res.status(500).render("errors/error", {
      message: "Failed to select department",
      error: error,
    });
  }
};
