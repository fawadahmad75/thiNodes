import { Patient } from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get all patients with search capabilities
const getAllPatients = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  let filters = {};
  if (search) {
    // Check if the search string matches any of these patterns
    if (search.match(/^[A-Za-z]+$/)) {
      // Search is likely a name
      filters.firstName = search;
    } else if (search.match(/^\d{5}-\d{7}-\d{1}$/)) {
      // Search looks like a CNIC
      filters.cnic = search;
    } else {
      // Search by patientId or other fields
      filters.patientId = search;
    }
  }

  const patients = await Patient.findAll(
    filters,
    parseInt(page),
    parseInt(limit)
  );

  // Calculate age for each patient
  const patientsWithAge = patients.map((patient) => ({
    ...patient,
    age: patient.dateOfBirth ? Patient.calculateAge(patient.dateOfBirth) : null,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        patients: patientsWithAge,
        page: parseInt(page),
        limit: parseInt(limit),
        total: patientsWithAge.length, // In a real implementation, we would need a count query
      },
      "Patients retrieved successfully"
    )
  );
});

// Search patients
const searchPatients = asyncHandler(async (req, res) => {
  const { query, firstName, lastName, patientId, cnic, guardianName, contact } =
    req.query;
  const { page = 1, limit = 10 } = req.query;

  let filters = {};

  // Build filters based on provided query parameters
  if (query) {
    // General search - check across multiple fields
    filters = {
      firstName: query,
      lastName: query,
      patientId: query,
      cnic: query,
      guardianName: query,
      contact: query,
    };
  } else {
    // Specific field searches
    if (firstName) filters.firstName = firstName;
    if (lastName) filters.lastName = lastName;
    if (patientId) filters.patientId = patientId;
    if (cnic) filters.cnic = cnic;
    if (guardianName) filters.guardianName = guardianName;
    if (contact) filters.contact = contact;
  }

  const patients = await Patient.findAll(
    filters,
    parseInt(page),
    parseInt(limit)
  );

  // Calculate age for each patient
  const patientsWithAge = patients.map((patient) => ({
    ...patient,
    age: patient.dateOfBirth ? Patient.calculateAge(patient.dateOfBirth) : null,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        patients: patientsWithAge,
        page: parseInt(page),
        limit: parseInt(limit),
        total: patientsWithAge.length,
      },
      "Patients retrieved successfully"
    )
  );
});

// Get patient by ID (which is now patientId from Oracle)
const getPatientById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // id parameter now directly corresponds to patientId from Oracle
  const patient = await Patient.findById(id);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // Calculate age
  const patientWithAge = {
    ...patient,
    age: patient.dateOfBirth ? Patient.calculateAge(patient.dateOfBirth) : null,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, patientWithAge, "Patient retrieved successfully")
    );
});

// Get patient by patientId
const getPatientByPatientId = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const patient = await Patient.findByPatientId(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // Calculate age
  const patientWithAge = {
    ...patient,
    age: patient.dateOfBirth ? Patient.calculateAge(patient.dateOfBirth) : null,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, patientWithAge, "Patient retrieved successfully")
    );
});

// Create new patient
const createPatient = asyncHandler(async (req, res) => {
  const {
    patientId, // This is the Oracle system ID that will be our primary key
    firstName,
    lastName,
    cnic,
    guardianName,
    dateOfBirth,
    gender,
    contact,
    address,
    medicalHistory,
    allergies,
  } = req.body;

  if (!patientId || !firstName || !lastName) {
    throw new ApiError(
      400,
      "PatientId (from Oracle system), firstName, and lastName are required"
    );
  }

  // Check if patientId already exists - since it's our primary key, it must be unique
  const existingPatient = await Patient.findById(patientId);
  if (existingPatient) {
    throw new ApiError(400, "Patient with this Oracle ID already exists");
  }

  // Check if CNIC already exists if provided
  if (cnic) {
    const patientWithCnic = await Patient.findByCNIC(cnic);
    if (patientWithCnic) {
      throw new ApiError(400, "Patient with this CNIC already exists");
    }
  }

  const patient = await Patient.create({
    patientId,
    firstName,
    lastName,
    cnic,
    guardianName,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    gender,
    contact,
    address,
    medicalHistory,
    allergies,
  });

  // Calculate age
  const patientWithAge = {
    ...patient,
    age: patient.dateOfBirth ? Patient.calculateAge(patient.dateOfBirth) : null,
  };

  return res
    .status(201)
    .json(new ApiResponse(201, patientWithAge, "Patient created successfully"));
});

// Update patient
const updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params; // id is now the Oracle patientId
  const {
    firstName,
    lastName,
    cnic,
    guardianName,
    dateOfBirth,
    gender,
    contact,
    address,
    medicalHistory,
    allergies,
  } = req.body;

  // patientId is removed from updatable fields since it's now the primary key

  // Check if patient exists
  const existingPatient = await Patient.findById(id);
  if (!existingPatient) {
    throw new ApiError(404, "Patient not found");
  }

  // Check if patientId already exists if being updated
  if (patientId && patientId !== existingPatient.patientId) {
    const patientWithId = await Patient.findByPatientId(patientId);
    if (patientWithId) {
      throw new ApiError(400, "Patient with this ID already exists");
    }
  }

  // Check if CNIC already exists if being updated
  if (cnic && cnic !== existingPatient.cnic) {
    const patientWithCnic = await Patient.findByCNIC(cnic);
    if (patientWithCnic && patientWithCnic.id !== parseInt(id)) {
      throw new ApiError(400, "Patient with this CNIC already exists");
    }
  }

  // Prepare update data
  const updateData = {};
  if (patientId) updateData.patientId = patientId;
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (cnic !== undefined) updateData.cnic = cnic;
  if (guardianName !== undefined) updateData.guardianName = guardianName;
  if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
  if (gender) updateData.gender = gender;
  if (contact !== undefined) updateData.contact = contact;
  if (address !== undefined) updateData.address = address;
  if (medicalHistory !== undefined) updateData.medicalHistory = medicalHistory;
  if (allergies !== undefined) updateData.allergies = allergies;

  const updatedPatient = await Patient.update(id, updateData);

  // Calculate age
  const patientWithAge = {
    ...updatedPatient,
    age: updatedPatient.dateOfBirth
      ? Patient.calculateAge(updatedPatient.dateOfBirth)
      : null,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, patientWithAge, "Patient updated successfully"));
});

// Delete patient
const deletePatient = asyncHandler(async (req, res) => {
  const { id } = req.params; // id is now the Oracle patientId

  // Check if patient exists
  const existingPatient = await Patient.findById(id);
  if (!existingPatient) {
    throw new ApiError(404, "Patient not found");
  }

  await Patient.delete(id); // This now deletes by patientId

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Patient deleted successfully"));
});

// Get recent patients for dashboard
const getRecentPatients = asyncHandler(async (req, res) => {
  // Sort by creation date and get most recent 5 patients
  const patients = await Patient.findAll({}, 1, 5);

  // Calculate age for each patient
  const patientsWithAge = patients.map((patient) => ({
    ...patient,
    age: patient.dateOfBirth ? Patient.calculateAge(patient.dateOfBirth) : null,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        patientsWithAge,
        "Recent patients retrieved successfully"
      )
    );
});

export {
  getAllPatients,
  searchPatients,
  getPatientById,
  getPatientByPatientId,
  createPatient,
  updatePatient,
  deletePatient,
  getRecentPatients,
};
