import express from "express";
import { User, Patient, Formulary } from "../models/index.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect("/auth/login");
};

// Middleware to check if user is NOT authenticated
const isNotAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  res.redirect("/dashboard");
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  res.redirect("/");
};

// Login page
router.get("/auth/login", isNotAuthenticated, (req, res) => {
  res.render("auth/login", {
    title: "Login",
    error: req.session.error,
    layout: "layouts/main",
  });
  // Clear any error messages
  delete req.session.error;
});

// Handle login
router.post("/auth/login", isNotAuthenticated, async (req, res) => {
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
});

// Handle logout
router.post("/auth/logout", isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/auth/login");
  });
});

// Dashboard page
router.get("/dashboard", isAuthenticated, async (req, res, next) => {
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
      activePatients: await Patient.countAll(),
    };

    // Get recent patients
    const recentPatients = await Patient.findAll({}, 1, 5);

    // For now, empty prescriptions until we implement them
    const recentPrescriptions = [];

    res.render("dashboard/index", {
      title: "Dashboard",
      active: "dashboard",
      stats,
      recentPatients,
      recentPrescriptions,
    });
  } catch (error) {
    next(error);
  }
});

// Patient Routes
router.get("/patients", isAuthenticated, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    // Build filters object
    const filters = {};
    if (req.query.search) {
      // The model will handle the search across multiple fields
      filters.search = req.query.search;
    }
    if (req.query.patientId) {
      filters.patientId = req.query.patientId;
    }
    if (req.query.dateFrom || req.query.dateTo) {
      filters.dateFrom = req.query.dateFrom;
      filters.dateTo = req.query.dateTo;
    }

    // Get patients with pagination
    const patients = await Patient.findAll(filters, page, limit);

    // Get total count for pagination
    const totalCount = await Patient.countAll(filters);
    const totalPages = Math.ceil(totalCount / limit);

    res.render("patients/index", {
      title: "Patients",
      active: "patients",
      patients,
      query: req.query,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
});

// New Patient Form
router.get("/patients/new", isAuthenticated, (req, res) => {
  res.render("patients/new", {
    title: "New Patient",
    active: "patients",
  });
});

// Create New Patient
router.post("/patients", isAuthenticated, async (req, res, next) => {
  try {
    // Basic validation
    if (!req.body.patientId || !req.body.firstName || !req.body.lastName) {
      req.session.error = "Required fields are missing";
      return res.redirect("/patients/new");
    }

    // Check if patient ID already exists
    const existingPatient = await Patient.findById(req.body.patientId);

    if (existingPatient) {
      req.session.error = "Patient ID already exists";
      return res.redirect("/patients/new");
    }

    // Create patient
    await Patient.create({
      patientId: req.body.patientId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      cnic: req.body.cnic,
      guardianName: req.body.guardianName,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      contact: req.body.contact,
      address: req.body.address,
      medicalHistory: req.body.medicalHistory,
      allergies: req.body.allergies,
    });

    res.redirect("/patients");
  } catch (error) {
    console.error("Error creating patient:", error);
    req.session.error = "Error creating patient";
    res.redirect("/patients/new");
  }
});

// Formulary routes
router.get("/formulary", isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const sort = req.query.sort || "name_asc";

    console.log("Querying formulary with:", {
      search,
      category,
      sort,
      page,
      limit,
    }); // Debug log

    const { data: medicines, total } = await Formulary.search({
      search,
      category,
      sort,
      page,
      limit,
    });

    console.log("Found medicines:", medicines?.length, "Total:", total); // Debug log

    const totalPages = Math.ceil(total / limit);
    res.render("formulary/index", {
      title: "Medicine Formulary",
      active: "formulary",
      medicines: medicines || [], // Ensure medicines is always an array
      currentPage: page,
      totalPages,
      query: {
        search,
        category,
        sort,
        toString: () =>
          Object.entries({ search, category, sort })
            .filter(([_, v]) => v)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join("&"),
      },
    });
  } catch (error) {
    console.error("Error in formulary index:", error);
    // Show more detailed error in development
    const errorMessage =
      process.env.NODE_ENV === "development"
        ? `Failed to load medicines: ${error.message}`
        : "Failed to load medicines";
    res.render("errors/error", {
      title: "Error",
      message: errorMessage,
      active: "formulary",
    });
  }
});

router.get("/formulary/new", isAdmin, (req, res) => {
  res.render("formulary/form", {
    title: "Add Medicine",
    active: "formulary",
    medicine: null,
  });
});

router.get("/formulary/:id/edit", isAdmin, async (req, res) => {
  try {
    const medicine = await Formulary.findById(req.params.id);
    if (!medicine) {
      return res.render("errors/404", {
        title: "Not Found",
        message: "Medicine not found",
      });
    }
    res.render("formulary/form", {
      title: "Edit Medicine",
      active: "formulary",
      medicine,
    });
  } catch (error) {
    console.error("Error in edit medicine:", error);
    res.render("errors/error", {
      title: "Error",
      message: "Failed to load medicine",
    });
  }
});

export default router;
