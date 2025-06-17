import bcrypt from "bcrypt";
import { User, Patient, Prescription } from "../../models/index.js";

class AuthViewController {
  async login(req, res) {
    res.render("auth/login", {
      title: "Login",
      error: req.session.error,
      layout: "layouts/main",
    });
    // Clear any error messages
    delete req.session.error;
  }

  async handleLogin(req, res) {
    try {
      const { username, password } = req.body;

      // Find user
      const user = await User.findByUsername(username);
      if (!user) {
        req.session.error = "Invalid username or password";
        return res.redirect("/auth/login");
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        req.session.error = "Invalid username or password";
        return res.redirect("/auth/login");
      }

      // Set user in session (exclude password)
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      req.session.user = userWithoutPassword;

      // Redirect to department selection if user has multiple departments
      if (
        userWithoutPassword.departments &&
        userWithoutPassword.departments.length > 1
      ) {
        res.redirect("/departments/select");
      } else if (
        userWithoutPassword.departments &&
        userWithoutPassword.departments.length === 1
      ) {
        // If user has only one department, set it as current and redirect to dashboard
        req.session.currentDepartment = userWithoutPassword.departments[0];
        res.redirect("/dashboard");
      } else {
        // Fallback for users without departments
        res.redirect("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      req.session.error = "An error occurred during login";
      res.redirect("/auth/login");
    }
  }

  async handleLogout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.redirect("/auth/login");
    });
  }
  async dashboard(req, res, next) {
    try {
      // Get current department from session
      const currentDepartmentId = req.session.currentDepartment;

      // If no department is selected and user has multiple departments, redirect to selection
      if (!currentDepartmentId && req.session.user.departments.length > 1) {
        return res.redirect("/departments/select");
      }

      // Get department details if available
      let currentDepartment = null;
      if (currentDepartmentId) {
        const { Department } = await import("../../models/index.js");
        currentDepartment = await Department.findById(currentDepartmentId);
      }

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get dashboard statistics - filtered by department if selected
      const filters = {
        dateFrom: today,
        dateTo: tomorrow,
      };

      if (currentDepartmentId) {
        filters.departmentId = currentDepartmentId;
      }

      // Base stats for all users
      const stats = {
        todayPatients: await Patient.countAll(filters),
        todayPrescriptions: await Prescription.countAll(filters),
        pendingTests: 0, // We'll implement this when test results module is ready
        activePatients: await Patient.countAll({ status: 'active' }),
      };

      // Add admin-specific stats
      if (req.session.user.role === 'admin') {
        const { User, Department } = await import("../../models/index.js");
        stats.totalUsers = await User.countAll();
        stats.totalDepartments = await Department.countAll();
      }

      // Get recent patients (last 10) - add department filter if appropriate
      const recentPatients = await Patient.findAll(filters, 1, 10);

      // Get recent prescriptions (last 10)
      const recentPrescriptions = await Prescription.findAll({}, 1, 10);

      res.render("dashboard/index", {
        title: currentDepartment
          ? `${currentDepartment.name} Dashboard`
          : "Dashboard",
        active: "dashboard",
        stats,
        user: req.session.user,
        currentDepartment,
        recentPatients,
        recentPrescriptions,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      next(error);
    }
  }
}

export default AuthViewController;
