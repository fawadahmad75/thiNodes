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

      // Redirect to dashboard
      res.redirect("/dashboard");
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
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get dashboard statistics
      const stats = {
        todayPatients: await Patient.countAll({
          dateFrom: today,
          dateTo: tomorrow,
        }),
        todayPrescriptions: 0, // We'll implement these later
        pendingTests: 0,
      }; // Get recent patients (last 10)
      const recentPatients = await Patient.findAll({}, 1, 10);

      // Get recent prescriptions (last 10)
      const recentPrescriptions = await Prescription.findAll({}, 1, 10);

      res.render("dashboard/index", {
        title: "Dashboard",
        active: "dashboard",
        stats,
        user: req.session.user,
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
