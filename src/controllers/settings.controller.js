import { HospitalSettings, PrintSettings } from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// === HOSPITAL SETTINGS CONTROLLERS ===

// Get hospital settings
const getHospitalSettings = asyncHandler(async (req, res) => {
  const settings = await HospitalSettings.get();

  if (!settings) {
    // If no settings exist, create default settings
    const defaultSettings = await HospitalSettings.resetToDefault();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          defaultSettings,
          "Default hospital settings retrieved successfully"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, settings, "Hospital settings retrieved successfully")
    );
});

// Update hospital settings
const updateHospitalSettings = asyncHandler(async (req, res) => {
  const {
    hospitalName,
    address,
    phone,
    email,
    website,
    headerText,
    footerText,
    logo,
  } = req.body;

  let settings = await HospitalSettings.get();

  // If no settings exist, create default first
  if (!settings) {
    settings = await HospitalSettings.resetToDefault();
  }

  // Update settings
  const updateData = {};
  if (hospitalName) updateData.hospitalName = hospitalName;
  if (address) updateData.address = address;
  if (phone) updateData.phone = phone;
  if (email) updateData.email = email;
  if (website) updateData.website = website;
  if (headerText) updateData.headerText = headerText;
  if (footerText) updateData.footerText = footerText;
  if (logo !== undefined) updateData.logo = logo;

  const updatedSettings = await HospitalSettings.update(updateData);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedSettings,
        "Hospital settings updated successfully"
      )
    );
});

// Reset hospital settings to default
const resetHospitalSettings = asyncHandler(async (req, res) => {
  const defaultSettings = await HospitalSettings.resetToDefault();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        defaultSettings,
        "Hospital settings reset to default successfully"
      )
    );
});

// === PRINT SETTINGS CONTROLLERS ===

// Get print settings
const getPrintSettings = asyncHandler(async (req, res) => {
  const settings = await PrintSettings.get();

  if (!settings) {
    // If no settings exist, create default settings
    const defaultSettings = await PrintSettings.resetToDefault();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          defaultSettings,
          "Default print settings retrieved successfully"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, settings, "Print settings retrieved successfully")
    );
});

// Update print settings
const updatePrintSettings = asyncHandler(async (req, res) => {
  const {
    headerText,
    footerText,
    showLogo,
    showDoctorInfo,
    showPatientId,
    fontSize,
    paperSize,
  } = req.body;

  let settings = await PrintSettings.get();

  // If no settings exist, create default first
  if (!settings) {
    settings = await PrintSettings.resetToDefault();
  }

  // Update settings
  const updateData = {};
  if (headerText) updateData.headerText = headerText;
  if (footerText) updateData.footerText = footerText;
  if (showLogo !== undefined) updateData.showLogo = showLogo;
  if (showDoctorInfo !== undefined) updateData.showDoctorInfo = showDoctorInfo;
  if (showPatientId !== undefined) updateData.showPatientId = showPatientId;
  if (fontSize) updateData.fontSize = fontSize;
  if (paperSize) updateData.paperSize = paperSize;

  const updatedSettings = await PrintSettings.update(updateData);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedSettings,
        "Print settings updated successfully"
      )
    );
});

// Reset print settings to default
const resetPrintSettings = asyncHandler(async (req, res) => {
  const defaultSettings = await PrintSettings.resetToDefault();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        defaultSettings,
        "Print settings reset to default successfully"
      )
    );
});

export {
  // Hospital settings
  getHospitalSettings,
  updateHospitalSettings,
  resetHospitalSettings,

  // Print settings
  getPrintSettings,
  updatePrintSettings,
  resetPrintSettings,
};
