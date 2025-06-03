import { TestResult, Patient, AdvisedTest } from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get all test results (with filters and pagination)
const getAllTestResults = asyncHandler(async (req, res) => {
  const {
    patientId,
    doctorId,
    advisedTestId,
    testName,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10,
  } = req.query;

  const filters = {};
  if (patientId) filters.patientId = patientId;
  if (doctorId) filters.doctorId = doctorId;
  if (advisedTestId) filters.advisedTestId = advisedTestId;
  if (testName) filters.testName = testName;
  if (dateFrom) filters.dateFrom = dateFrom;
  if (dateTo) filters.dateTo = dateTo;

  const testResults = await TestResult.findAll(
    filters,
    parseInt(page),
    parseInt(limit)
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, testResults, "Test results retrieved successfully")
    );
});

// Get test result by ID
const getTestResultById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const testResult = await TestResult.findById(id);
  if (!testResult) {
    throw new ApiError(404, "Test result not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, testResult, "Test result retrieved successfully")
    );
});

// Get test results by patient ID
const getTestResultsByPatientId = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Check if patient exists
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  const testResults = await TestResult.findByPatientId(
    patientId,
    parseInt(page),
    parseInt(limit)
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, testResults, "Test results retrieved successfully")
    );
});

// Create new test result
const createTestResult = asyncHandler(async (req, res) => {
  const {
    patientId,
    doctorId,
    advisedTestId,
    testName,
    testDate,
    testParameters,
    results,
    normalRanges,
    interpretation,
    remarks,
  } = req.body;

  if (!patientId || !testName) {
    throw new ApiError(400, "Patient ID and test name are required");
  }

  // Check if patient exists
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // If advisedTestId provided, check if it exists
  if (advisedTestId) {
    const advisedTest = await AdvisedTest.findById(advisedTestId);
    if (!advisedTest) {
      throw new ApiError(404, "Advised test not found");
    }
  }

  const testResult = await TestResult.create({
    patientId,
    doctorId: doctorId || req.user.id,
    advisedTestId,
    testName,
    testDate: testDate || new Date(),
    testParameters,
    results,
    normalRanges,
    interpretation,
    remarks,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, testResult, "Test result created successfully"));
});

// Update test result
const updateTestResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { testParameters, results, normalRanges, interpretation, remarks } =
    req.body;

  // Check if test result exists
  const existingTestResult = await TestResult.findById(id);
  if (!existingTestResult) {
    throw new ApiError(404, "Test result not found");
  }

  // Update test result
  const updateData = {};
  if (testParameters) updateData.testParameters = testParameters;
  if (results) updateData.results = results;
  if (normalRanges) updateData.normalRanges = normalRanges;
  if (interpretation) updateData.interpretation = interpretation;
  if (remarks) updateData.remarks = remarks;

  const updatedTestResult = await TestResult.update(id, updateData);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedTestResult,
        "Test result updated successfully"
      )
    );
});

// Delete test result
const deleteTestResult = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if test result exists
  const existingTestResult = await TestResult.findById(id);
  if (!existingTestResult) {
    throw new ApiError(404, "Test result not found");
  }

  // Delete test result
  await TestResult.delete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Test result deleted successfully"));
});

export {
  getAllTestResults,
  getTestResultById,
  getTestResultsByPatientId,
  createTestResult,
  updateTestResult,
  deleteTestResult,
};
