import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import {
  Prescription,
  Patient,
  User,
  MedicineInPrescription,
  AdvisedTest,
  HospitalSettings,
  PrintSettings,
} from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get all prescriptions with filtering options
const getAllPrescriptions = asyncHandler(async (req, res) => {
  const {
    patientId,
    doctorId,
    status,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10,
  } = req.query;

  // Prepare filters
  let filters = {};
  if (patientId) filters.patientId = parseInt(patientId);
  if (doctorId) filters.doctorId = parseInt(doctorId);
  if (status) filters.status = status;
  if (dateFrom) filters.dateFrom = new Date(dateFrom);
  if (dateTo) filters.dateTo = new Date(dateTo);

  const prescriptions = await Prescription.findAll(
    filters,
    parseInt(page),
    parseInt(limit)
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        prescriptions,
        page: parseInt(page),
        limit: parseInt(limit),
        total: prescriptions.length,
      },
      "Prescriptions retrieved successfully"
    )
  );
});

// Get recent prescriptions for dashboard
const getRecentPrescriptions = asyncHandler(async (req, res) => {
  // Get last 5 prescriptions sorted by date
  const prescriptions = await Prescription.findAll({}, 1, 5);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        prescriptions,
        "Recent prescriptions retrieved successfully"
      )
    );
});

// Get prescription by ID with medicines and advised tests
const getPrescriptionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const prescription = await Prescription.getCompletePrescription(id);
  if (!prescription) {
    throw new ApiError(404, "Prescription not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, prescription, "Prescription retrieved successfully")
    );
});

// Get prescriptions by patient ID
const getPrescriptionsByPatientId = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!patientId) {
    throw new ApiError(400, "Patient ID is required");
  }
  const prescriptions = await Prescription.findByPatientId(
    patientId, // patientId is now a string from Oracle, not an integer
    parseInt(page),
    parseInt(limit)
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        prescriptions,
        page: parseInt(page),
        limit: parseInt(limit),
        total: prescriptions.length,
      },
      "Prescriptions retrieved successfully"
    )
  );
});

// Create new prescription with medicines and advised tests
const createPrescription = asyncHandler(async (req, res) => {
  const { prescription, medicines = [], advisedTests = [] } = req.body;

  if (!prescription || !prescription.patientId) {
    throw new ApiError(400, "Prescription data with patient ID is required");
  }

  // Validate patient exists
  const patient = await Patient.findById(prescription.patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // Set doctor ID from authenticated user
  prescription.doctorId = req.user.id;

  // Create transaction manually (simple implementation)
  try {
    // Create the prescription first
    const newPrescription = await Prescription.create(prescription);
    const prescriptionId = newPrescription.id;

    // Add medicines to prescription if any
    if (medicines && medicines.length > 0) {
      for (const medicine of medicines) {
        medicine.prescriptionId = prescriptionId;
        await MedicineInPrescription.create(medicine);
      }
    }

    // Add advised tests if any
    if (advisedTests && advisedTests.length > 0) {
      for (const test of advisedTests) {
        test.prescriptionId = prescriptionId;
        await AdvisedTest.create(test);
      }
    }

    // Get the complete prescription with medicines and tests
    const completePrescription =
      await Prescription.getCompletePrescription(prescriptionId);

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          completePrescription,
          "Prescription created successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, `Error creating prescription: ${error.message}`);
  }
});

// Update prescription
const updatePrescription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, clinicalNotes, additionalInstructions } = req.body;

  // Check if prescription exists
  const existingPrescription = await Prescription.findById(id);
  if (!existingPrescription) {
    throw new ApiError(404, "Prescription not found");
  }

  // Prepare update data (limited fields that can be updated)
  const updateData = {};
  if (status) updateData.status = status;
  if (clinicalNotes !== undefined) updateData.clinicalNotes = clinicalNotes;
  if (additionalInstructions !== undefined)
    updateData.additionalInstructions = additionalInstructions;

  const updatedPrescription = await Prescription.update(id, updateData);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPrescription,
        "Prescription updated successfully"
      )
    );
});

// Delete prescription
const deletePrescription = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if prescription exists
  const existingPrescription = await Prescription.findById(id);
  if (!existingPrescription) {
    throw new ApiError(404, "Prescription not found");
  }

  await Prescription.delete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Prescription deleted successfully"));
});

// Update prescription status
const updatePrescriptionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["active", "completed", "discontinued"].includes(status)) {
    throw new ApiError(
      400,
      "Valid status required (active, completed, or discontinued)"
    );
  }

  // Check if prescription exists
  const existingPrescription = await Prescription.findById(id);
  if (!existingPrescription) {
    throw new ApiError(404, "Prescription not found");
  }

  await Prescription.updateStatus(id, status);
  const updatedPrescription = await Prescription.findById(id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPrescription,
        "Prescription status updated successfully"
      )
    );
});

// Generate PDF for prescription
const generatePrescriptionPDF = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get prescription with all its medicines and tests
  const prescription = await Prescription.getCompletePrescription(id);
  if (!prescription) {
    throw new ApiError(404, "Prescription not found");
  }

  // Get related data
  const patient = await Patient.findById(prescription.patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  const doctor = await User.findById(prescription.doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // Get settings
  const hospitalSettings = await HospitalSettings.get();
  const printSettings = await PrintSettings.get();

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create PDF
  const filename = `prescription_${id}_${Date.now()}.pdf`;
  const filePath = path.join(uploadsDir, filename);
  const fileUrl = `/uploads/${filename}`;

  // Create PDF document
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(filePath);

  // Pipe to writable stream
  doc.pipe(stream);

  // Hospital header
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text(hospitalSettings ? hospitalSettings.hospitalName : "Hospital", {
      align: "center",
    });

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(hospitalSettings ? hospitalSettings.address : "Address", {
      align: "center",
    });

  doc.text(`Phone: ${hospitalSettings ? hospitalSettings.phone : ""}`, {
    align: "center",
  });
  doc.moveDown();

  // Line separator
  doc
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .stroke();
  doc.moveDown();

  // Patient info and date
  const startY = doc.y;
  doc.fontSize(10).text("Patient:", 50, startY);
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(`${patient.firstName} ${patient.lastName}`, 110, startY);
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`ID: ${patient.patientId}`, 110, startY + 15);

  // Include age from DOB
  const age = patient.dateOfBirth
    ? Patient.calculateAge(patient.dateOfBirth)
    : null;
  doc.text(
    `Age/Gender: ${age || ""}/${patient.gender || ""}`,
    110,
    startY + 30
  );

  // Date on right
  doc.fontSize(10).text("Date:", 350, startY);
  const dateStr = prescription.date
    ? new Date(prescription.date).toLocaleDateString()
    : new Date(prescription.createdAt).toLocaleDateString();
  doc.fontSize(12).font("Helvetica-Bold").text(dateStr, 400, startY);

  doc.moveDown(3);

  // Rx Symbol
  doc.fontSize(18).font("Helvetica-Bold").text("Rx", 50);
  doc.moveDown();

  // List medicines
  if (prescription.medicines && prescription.medicines.length > 0) {
    prescription.medicines.forEach((medicine, index) => {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(
          `${index + 1}. ${medicine.medicineName} ${medicine.strength || ""} ${medicine.dosageForm || ""}`,
          50
        );

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Take ${medicine.dosage} ${medicine.frequency} for ${medicine.duration} ${medicine.instructions ? "- " + medicine.instructions : ""}`,
          70
        );

      doc.moveDown();
    });
  }

  // Advised tests
  if (prescription.advisedTests && prescription.advisedTests.length > 0) {
    doc
      .moveDown()
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Advised Tests:", 50);

    prescription.advisedTests.forEach((test, index) => {
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `${index + 1}. ${test.testName}${test.instructions ? " - " + test.instructions : ""}`,
          70
        );
    });

    doc.moveDown();
  }

  // Clinical notes (not for patient)
  if (prescription.clinicalNotes) {
    doc
      .moveDown()
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Clinical Notes (Not for patient):", 50);

    doc.fontSize(10).font("Helvetica").text(prescription.clinicalNotes, 50);

    doc.moveDown();
  }

  // Additional instructions
  if (prescription.additionalInstructions) {
    doc
      .moveDown()
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Additional Instructions:", 50);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(prescription.additionalInstructions, 50);

    doc.moveDown();
  }

  // Doctor's signature
  doc.moveDown(4);
  doc
    .fontSize(10)
    .text("", doc.page.width - 150, doc.y, { width: 100, align: "center" });

  doc
    .moveTo(doc.page.width - 200, doc.y)
    .lineTo(doc.page.width - 100, doc.y)
    .stroke();

  doc.moveDown();
  const doctorName =
    doctor.name || `Dr. ${doctor.firstName || ""} ${doctor.lastName || ""}`;

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(doctorName, doc.page.width - 200, doc.y, {
      width: 150,
      align: "center",
    });

  if (doctor.specialization) {
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(doctor.specialization, doc.page.width - 200, doc.y + 15, {
        width: 150,
        align: "center",
      });
  }

  // Finalize the PDF
  doc.end();

  // Send the file URL after it's written
  stream.on("finish", () => {
    res
      .status(200)
      .json(
        new ApiResponse(200, { pdfUrl: fileUrl }, "PDF generated successfully")
      );
  });

  stream.on("error", (err) => {
    throw new ApiError(500, `Error generating PDF: ${err.message}`);
  });
});

// Get dashboard stats
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get all prescriptions
  const allPrescriptions = await Prescription.findAll({});

  // Calculate total prescriptions
  const totalPrescriptions = allPrescriptions.length;

  // Get today's prescriptions
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayPrescriptions = allPrescriptions.filter((p) => {
    const prescriptionDate = new Date(p.createdAt);
    prescriptionDate.setHours(0, 0, 0, 0);
    return prescriptionDate.getTime() === today.getTime();
  }).length;

  // Get this month's prescriptions
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  const thisMonthPrescriptions = allPrescriptions.filter((p) => {
    const prescriptionDate = new Date(p.createdAt);
    return (
      prescriptionDate.getMonth() === thisMonth &&
      prescriptionDate.getFullYear() === thisYear
    );
  }).length;

  // Get new vs. repeat patient prescriptions
  const patientPrescriptionCounts = {};

  allPrescriptions.forEach((p) => {
    patientPrescriptionCounts[p.patientId] =
      (patientPrescriptionCounts[p.patientId] || 0) + 1;
  });

  const newPatientPrescriptions = Object.values(
    patientPrescriptionCounts
  ).filter((count) => count === 1).length;

  const repeatPatientPrescriptions = Object.values(
    patientPrescriptionCounts
  ).filter((count) => count > 1).length;

  // Get monthly breakdown for the last 6 months
  const last6Months = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - i);
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();

    const count = allPrescriptions.filter((p) => {
      const prescriptionDate = new Date(p.createdAt);
      return (
        prescriptionDate.getMonth() === month &&
        prescriptionDate.getFullYear() === year
      );
    }).length;

    last6Months.push({
      month: `${monthNames[month]} ${year}`,
      count,
    });
  }

  // Get prescription status counts
  const statusCounts = {
    active: allPrescriptions.filter((p) => p.status === "active").length,
    completed: allPrescriptions.filter((p) => p.status === "completed").length,
    discontinued: allPrescriptions.filter((p) => p.status === "discontinued")
      .length,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalPrescriptions,
        todayPrescriptions,
        thisMonthPrescriptions,
        newPatientPrescriptions,
        repeatPatientPrescriptions,
        monthlyBreakdown: last6Months,
        statusCounts,
      },
      "Dashboard statistics retrieved successfully"
    )
  );
});

export {
  getAllPrescriptions,
  getRecentPrescriptions,
  getPrescriptionById,
  getPrescriptionsByPatientId,
  createPrescription,
  updatePrescription,
  deletePrescription,
  updatePrescriptionStatus,
  generatePrescriptionPDF,
  getDashboardStats,
};
