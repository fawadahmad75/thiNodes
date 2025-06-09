import { TestResult, Patient } from "../../models/index.js";
import path from "path";
import fs from "fs";

class TestResultViewController {
  // Show all test results
  async index(req, res) {
    try {
      // Extract query parameters
      const patientId = req.query.patientId;
      const testName = req.query.testName;
      const dateFrom = req.query.dateFrom;
      const dateTo = req.query.dateTo;

      // Prepare filters
      let filters = {};
      if (patientId) filters.patientId = parseInt(patientId);
      if (testName) filters.testName = testName;
      if (dateFrom) filters.dateFrom = new Date(dateFrom);
      if (dateTo) filters.dateTo = new Date(dateTo);

      // Get page and limit
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const testResults = await TestResult.findAll(
        filters,
        parseInt(page),
        parseInt(limit)
      );

      // Count total records for pagination
      const total = await TestResult.countAll(filters);
      const totalPages = Math.ceil(total / limit);

      res.render("test-results/index", {
        title: "Test Results",
        active: "test-results",
        testResults,
        currentPage: page,
        totalPages,
        query: {
          patientId,
          testName,
          dateFrom,
          dateTo,
        },
      });
    } catch (error) {
      console.error("Error fetching test results:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to load test results",
      });
    }
  }

  // Show form to upload a new test result
  async new(req, res) {
    try {
      // Get patient if patientId is provided
      let patient = null;
      if (req.query.patientId) {
        patient = await Patient.findById(parseInt(req.query.patientId));
      }

      // Get all patients for dropdown if no specific patient
      const patients = patient ? null : await Patient.findAll();

      res.render("test-results/form", {
        title: "Upload Test Result",
        active: "test-results",
        testResult: null,
        patient,
        patients,
        today: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD
      });
    } catch (error) {
      console.error("Error loading test result form:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to load test result form",
      });
    }
  }

  // Show a test result detail
  async show(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.render("errors/404", {
          title: "Invalid ID",
          message: "Invalid test result ID format",
        });
      }

      const testResult = await TestResult.findById(id);
      if (!testResult) {
        return res.render("errors/404", {
          title: "Not Found",
          message: "Test result not found",
        });
      }

      // Get patient info
      const patient = await Patient.findById(testResult.patientId);

      res.render("test-results/show", {
        title: "Test Result Details",
        active: "test-results",
        testResult,
        patient,
      });
    } catch (error) {
      console.error("Error fetching test result:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to load test result",
      });
    }
  }

  // Show form to edit a test result
  async edit(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.render("errors/404", {
          title: "Invalid ID",
          message: "Invalid test result ID format",
        });
      }

      const testResult = await TestResult.findById(id);
      if (!testResult) {
        return res.render("errors/404", {
          title: "Not Found",
          message: "Test result not found",
        });
      }

      // Get patient info
      const patient = await Patient.findById(testResult.patientId);

      res.render("test-results/form", {
        title: "Edit Test Result",
        active: "test-results",
        testResult,
        patient,
        patients: null, // No need for patient dropdown when editing
      });
    } catch (error) {
      console.error("Error loading test result form:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to load test result form",
      });
    }
  }

  // Upload and create a new test result
  async create(req, res) {
    try {
      // Handle file upload if present
      let filePath = null;
      if (req.file) {
        // Save file path relative to uploads folder
        filePath = req.file.path.replace(
          path.join(process.cwd(), "uploads"),
          ""
        );
        // Make sure the path starts with a slash
        if (!filePath.startsWith("/")) {
          filePath = "/" + filePath;
        }
      }

      // Extract and prepare the test result data from form
      const testResultData = {
        patientId: parseInt(req.body.patientId),
        uploadedBy: req.session.user.id, // Current logged-in user
        testName: req.body.testName,
        testDate: req.body.testDate || new Date(),
        filePath,
        results: req.body.results,
        notes: req.body.notes,
      };

      // Create test result
      const testResult = await TestResult.create(testResultData);

      req.session.successMessage = "Test result uploaded successfully";
      res.redirect(`/test-results/${testResult.id}`);
    } catch (error) {
      console.error("Error uploading test result:", error);

      // Prepare data to redisplay the form with entered values
      let patient = null;
      try {
        patient = await Patient.findById(parseInt(req.body.patientId));
      } catch (e) {
        console.error("Error fetching patient:", e);
      }

      // Get all patients for dropdown if no specific patient
      const patients = patient ? null : await Patient.findAll();

      res.render("test-results/form", {
        title: "Upload Test Result",
        active: "test-results",
        testResult: req.body,
        patient,
        patients,
        error: error.message,
      });
    }
  }

  // Update an existing test result
  async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new Error("Invalid test result ID format");
      }

      // Get existing test result to keep file path if no new file uploaded
      const existingTestResult = await TestResult.findById(id);

      // Handle file upload if present
      let filePath = existingTestResult.filePath;
      if (req.file) {
        // Delete old file if exists
        if (existingTestResult.filePath) {
          const oldFilePath = path.join(
            process.cwd(),
            "uploads",
            existingTestResult.filePath
          );
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }

        // Save new file path
        filePath = req.file.path.replace(
          path.join(process.cwd(), "uploads"),
          ""
        );
        // Make sure the path starts with a slash
        if (!filePath.startsWith("/")) {
          filePath = "/" + filePath;
        }
      }

      // Extract and prepare the test result data from form
      const testResultData = {
        patientId: parseInt(req.body.patientId),
        uploadedBy: parseInt(req.body.uploadedBy) || req.session.user.id,
        testName: req.body.testName,
        testDate: req.body.testDate,
        filePath,
        results: req.body.results,
        notes: req.body.notes,
      };

      // Update test result
      await TestResult.update(id, testResultData);

      req.session.successMessage = "Test result updated successfully";
      res.redirect(`/test-results/${id}`);
    } catch (error) {
      console.error("Error updating test result:", error);

      // Prepare data to redisplay the form with entered values
      const formData = { ...req.body, id: parseInt(req.params.id) };

      // Get patient info
      let patient = null;
      try {
        patient = await Patient.findById(parseInt(req.body.patientId));
      } catch (e) {
        console.error("Error fetching patient:", e);
      }

      res.render("test-results/form", {
        title: "Edit Test Result",
        active: "test-results",
        testResult: formData,
        patient,
        error: error.message,
      });
    }
  }

  // Delete a test result
  async delete(req, res) {
    try {
      const id = parseInt(req.body.id);
      if (isNaN(id)) {
        throw new Error("Invalid test result ID format");
      }

      // Get test result to delete the file too
      const testResult = await TestResult.findById(id);
      if (testResult && testResult.filePath) {
        const filePath = path.join(
          process.cwd(),
          "uploads",
          testResult.filePath
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Delete the test result record
      await TestResult.delete(id);

      req.session.successMessage = "Test result deleted successfully";
      res.redirect("/test-results");
    } catch (error) {
      console.error("Error deleting test result:", error);
      req.session.errorMessage = "Failed to delete test result";
      res.redirect("/test-results");
    }
  }

  // Download the test result file
  async download(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.render("errors/404", {
          title: "Invalid ID",
          message: "Invalid test result ID format",
        });
      }

      const testResult = await TestResult.findById(id);
      if (!testResult || !testResult.filePath) {
        return res.render("errors/404", {
          title: "Not Found",
          message: "Test result file not found",
        });
      }

      const filePath = path.join(process.cwd(), "uploads", testResult.filePath);
      if (!fs.existsSync(filePath)) {
        return res.render("errors/404", {
          title: "Not Found",
          message: "Test result file not found on server",
        });
      }

      res.download(
        filePath,
        `${testResult.testName}-${testResult.testDate}.pdf`
      );
    } catch (error) {
      console.error("Error downloading test result file:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to download test result file",
      });
    }
  }
}

export default TestResultViewController;
