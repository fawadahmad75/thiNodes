import {
  Prescription,
  Patient,
  User,
  MedicineInPrescription,
  AdvisedTest,
  HospitalSettings,
  PrintSettings,
} from "../../models/index.js";
import PDFDocument from "pdfkit";

class PrescriptionViewController {
  // Show all prescriptions
  async index(req, res) {
    try {
      // Extract query parameters
      const patientId = req.query.patientId;
      const doctorId = req.query.doctorId;
      const status = req.query.status;
      const dateFrom = req.query.dateFrom;
      const dateTo = req.query.dateTo;

      // Prepare filters
      let filters = {};
      if (patientId) filters.patientId = parseInt(patientId);
      if (doctorId) filters.doctorId = parseInt(doctorId);
      if (status) filters.status = status;
      if (dateFrom) filters.dateFrom = new Date(dateFrom);
      if (dateTo) filters.dateTo = new Date(dateTo);

      // Get page and limit
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const prescriptions = await Prescription.findAll(
        filters,
        parseInt(page),
        parseInt(limit)
      );

      // Count total records for pagination
      const total = await Prescription.countAll(filters);
      const totalPages = Math.ceil(total / limit);

      res.render("prescriptions/index", {
        title: "Prescriptions",
        active: "prescriptions",
        prescriptions,
        currentPage: page,
        totalPages,
        query: {
          patientId,
          doctorId,
          status,
          dateFrom,
          dateTo,
        },
      });
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to load prescriptions",
      });
    }
  }

  // Show form to create a new prescription
  async new(req, res) {
    try {
      // Get patient if patientId is provided
      let patient = null;
      if (req.query.patientId) {
        patient = await Patient.findById(parseInt(req.query.patientId));
      }

      // Get medicine list for dropdown
      const medicines = await Formulary.findAll();

      // Get test list for dropdown
      const tests = await TestCatalog.findAll();

      res.render("prescriptions/form", {
        title: "New Prescription",
        active: "prescriptions",
        prescription: null,
        patient,
        medicines,
        tests,
        today: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD
      });
    } catch (error) {
      console.error("Error loading prescription form:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to load prescription form",
      });
    }
  }

  // Show a prescription details
  async show(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.render("errors/404", {
          title: "Invalid ID",
          message: "Invalid prescription ID format",
        });
      }

      // Get prescription with all related data
      const prescription = await Prescription.findById(id);
      if (!prescription) {
        return res.render("errors/404", {
          title: "Not Found",
          message: "Prescription not found",
        });
      }

      // Get patient info
      const patient = await Patient.findById(prescription.patientId);

      // Get doctor info
      const doctor = await User.findById(prescription.doctorId);

      // Get medicines prescribed
      const medicines = await MedicineInPrescription.findByPrescriptionId(id);

      // Get advised tests
      const tests = await AdvisedTest.findByPrescriptionId(id);

      res.render("prescriptions/show", {
        title: "Prescription Details",
        active: "prescriptions",
        prescription,
        patient,
        doctor,
        medicines,
        tests,
      });
    } catch (error) {
      console.error("Error fetching prescription:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to load prescription",
      });
    }
  }

  // Show form to edit a prescription
  async edit(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.render("errors/404", {
          title: "Invalid ID",
          message: "Invalid prescription ID format",
        });
      }

      // Get the prescription
      const prescription = await Prescription.findById(id);
      if (!prescription) {
        return res.render("errors/404", {
          title: "Not Found",
          message: "Prescription not found",
        });
      }

      // Get patient info
      const patient = await Patient.findById(prescription.patientId);

      // Get medicines prescribed
      const prescribedMedicines =
        await MedicineInPrescription.findByPrescriptionId(id);

      // Get advised tests
      const advisedTests = await AdvisedTest.findByPrescriptionId(id);

      // Get available medicines for dropdown
      const medicines = await Formulary.findAll();

      // Get available tests for dropdown
      const tests = await TestCatalog.findAll();

      res.render("prescriptions/form", {
        title: "Edit Prescription",
        active: "prescriptions",
        prescription,
        patient,
        prescribedMedicines,
        advisedTests,
        medicines,
        tests,
      });
    } catch (error) {
      console.error("Error loading prescription form:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to load prescription form",
      });
    }
  }

  // Create a new prescription
  async create(req, res) {
    try {
      // Extract and prepare the prescription data from form
      const prescriptionData = {
        patientId: parseInt(req.body.patientId),
        doctorId: req.session.user.id, // Current logged-in user is the doctor
        date: req.body.date || new Date(),
        symptoms: req.body.symptoms,
        diagnosis: req.body.diagnosis,
        notes: req.body.notes,
        status: req.body.status || "active",
      };

      // Create prescription
      const prescription = await Prescription.create(prescriptionData);

      // Handle prescribed medicines
      if (req.body.medicines && Array.isArray(req.body.medicines)) {
        for (const medicineData of req.body.medicines) {
          await MedicineInPrescription.create({
            prescriptionId: prescription.id,
            medicineId: parseInt(medicineData.id),
            dosage: medicineData.dosage,
            frequency: medicineData.frequency,
            duration: medicineData.duration,
            notes: medicineData.notes,
          });
        }
      }

      // Handle advised tests
      if (req.body.tests && Array.isArray(req.body.tests)) {
        for (const testId of req.body.tests) {
          await AdvisedTest.create({
            prescriptionId: prescription.id,
            testId: parseInt(testId),
            notes: req.body.testNotes || "",
          });
        }
      }

      req.session.successMessage = "Prescription created successfully";
      res.redirect(`/prescriptions/${prescription.id}`);
    } catch (error) {
      console.error("Error creating prescription:", error);

      // Prepare data to redisplay the form with entered values
      let patient = null;
      try {
        patient = await Patient.findById(parseInt(req.body.patientId));
      } catch (e) {
        console.error("Error fetching patient:", e);
      }

      res.render("prescriptions/form", {
        title: "New Prescription",
        active: "prescriptions",
        prescription: req.body,
        patient,
        error: error.message,
      });
    }
  }

  // Update an existing prescription
  async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new Error("Invalid prescription ID format");
      }

      // Extract and prepare the prescription data from form
      const prescriptionData = {
        patientId: parseInt(req.body.patientId),
        doctorId: parseInt(req.body.doctorId) || req.session.user.id,
        date: req.body.date,
        symptoms: req.body.symptoms,
        diagnosis: req.body.diagnosis,
        notes: req.body.notes,
        status: req.body.status,
      };

      // Update prescription
      await Prescription.update(id, prescriptionData);

      // Update prescribed medicines - first delete existing
      await MedicineInPrescription.deleteByPrescriptionId(id);

      // Then create new ones
      if (req.body.medicines && Array.isArray(req.body.medicines)) {
        for (const medicineData of req.body.medicines) {
          await MedicineInPrescription.create({
            prescriptionId: id,
            medicineId: parseInt(medicineData.id),
            dosage: medicineData.dosage,
            frequency: medicineData.frequency,
            duration: medicineData.duration,
            notes: medicineData.notes,
          });
        }
      }

      // Update advised tests - first delete existing
      await AdvisedTest.deleteByPrescriptionId(id);

      // Then create new ones
      if (req.body.tests && Array.isArray(req.body.tests)) {
        for (const testId of req.body.tests) {
          await AdvisedTest.create({
            prescriptionId: id,
            testId: parseInt(testId),
            notes: req.body.testNotes || "",
          });
        }
      }

      req.session.successMessage = "Prescription updated successfully";
      res.redirect(`/prescriptions/${id}`);
    } catch (error) {
      console.error("Error updating prescription:", error);

      // Prepare data to redisplay the form with entered values
      const formData = { ...req.body, id: parseInt(req.params.id) };

      res.render("prescriptions/form", {
        title: "Edit Prescription",
        active: "prescriptions",
        prescription: formData,
        error: error.message,
      });
    }
  }

  // Generate and download PDF
  async generatePDF(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.render("errors/404", {
          title: "Invalid ID",
          message: "Invalid prescription ID format",
        });
      }

      // Get all required data
      const prescription = await Prescription.findById(id);
      if (!prescription) {
        return res.render("errors/404", {
          title: "Not Found",
          message: "Prescription not found",
        });
      }

      const patient = await Patient.findById(prescription.patientId);
      const doctor = await User.findById(prescription.doctorId);
      const medicines = await MedicineInPrescription.findByPrescriptionId(id);
      const tests = await AdvisedTest.findByPrescriptionId(id);

      // Get hospital and print settings
      const hospitalSettings = await HospitalSettings.findFirst();
      const printSettings = await PrintSettings.findFirst();

      // Create a PDF document
      const doc = new PDFDocument({ margin: 50 });

      // Set response headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=prescription-${id}.pdf`
      );

      // Pipe the PDF document to the response
      doc.pipe(res);

      // Add content to the PDF
      // Header with hospital info
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(hospitalSettings.name || "Medical Center", { align: "center" })
        .fontSize(12)
        .font("Helvetica")
        .text(hospitalSettings.address || "", { align: "center" })
        .text(`Phone: ${hospitalSettings.phone || ""}`, { align: "center" })
        .moveDown();

      // Patient and prescription info
      doc
        .fontSize(12)
        .text(`Date: ${new Date(prescription.date).toLocaleDateString()}`)
        .text(`Patient: ${patient.name}`)
        .text(
          `Age/Gender: ${patient.age || "N/A"} / ${patient.gender || "N/A"}`
        )
        .text(`Patient ID: ${patient.patientId || patient.id}`)
        .moveDown();

      // Symptoms and diagnosis
      if (prescription.symptoms) {
        doc
          .font("Helvetica-Bold")
          .text("Symptoms:")
          .font("Helvetica")
          .text(prescription.symptoms)
          .moveDown();
      }

      if (prescription.diagnosis) {
        doc
          .font("Helvetica-Bold")
          .text("Diagnosis:")
          .font("Helvetica")
          .text(prescription.diagnosis)
          .moveDown();
      }

      // Medicines
      doc.font("Helvetica-Bold").text("Medicines:").moveDown();
      if (medicines.length > 0) {
        medicines.forEach((med, i) => {
          doc
            .font("Helvetica")
            .text(`${i + 1}. ${med.medicineName} - ${med.dosage}`)
            .text(`   ${med.frequency}, for ${med.duration}`)
            .text(`   Notes: ${med.notes || "None"}`)
            .moveDown(0.5);
        });
      } else {
        doc.font("Helvetica").text("No medicines prescribed").moveDown();
      }

      // Tests
      if (tests.length > 0) {
        doc.font("Helvetica-Bold").text("Advised Tests:").moveDown();
        tests.forEach((test, i) => {
          doc
            .font("Helvetica")
            .text(`${i + 1}. ${test.testName}`)
            .text(`   Notes: ${test.notes || "None"}`)
            .moveDown(0.5);
        });
      }

      // Notes
      if (prescription.notes) {
        doc
          .font("Helvetica-Bold")
          .text("Additional Notes:")
          .font("Helvetica")
          .text(prescription.notes)
          .moveDown();
      }

      // Doctor's info and signature
      doc
        .moveDown(2)
        .font("Helvetica")
        .text(`Dr. ${doctor.name}`, { align: "right" })
        .text(`${doctor.specialization || ""}`, { align: "right" })
        .text(`${doctor.regNumber || ""}`, { align: "right" });

      // Footer
      if (printSettings.footer) {
        doc.fontSize(10).text(printSettings.footer, { align: "center" });
      }

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error("Error generating prescription PDF:", error);
      res.render("errors/error", {
        title: "Error",
        message: "Failed to generate prescription PDF",
      });
    }
  }

  // Delete a prescription
  async delete(req, res) {
    try {
      const id = parseInt(req.body.id);
      if (isNaN(id)) {
        throw new Error("Invalid prescription ID format");
      }

      // Delete the prescription and all related records
      await Prescription.delete(id);

      req.session.successMessage = "Prescription deleted successfully";
      res.redirect("/prescriptions");
    } catch (error) {
      console.error("Error deleting prescription:", error);
      req.session.errorMessage = "Failed to delete prescription";
      res.redirect("/prescriptions");
    }
  }
}

export default PrescriptionViewController;
