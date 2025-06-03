import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateToken } from "../middlewares/auth.js";

// Register a new user (admin only can register new doctors/admins)
const registerUser = asyncHandler(async (req, res) => {
  const {
    username,
    password,
    name,
    email,
    role,
    specialization,
    licenseNumber,
    contactNumber,
  } = req.body;

  if (!username || !password || !name || !email) {
    throw new ApiError(400, "Username, password, name, and email are required");
  }

  // Check if username already exists
  const existingUser = await User.findByUsername(username);
  if (existingUser) {
    throw new ApiError(400, "Username already exists");
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await User.create({
    username,
    password: hashedPassword,
    name,
    email,
    role: role || "doctor", // Default role is doctor
    specialization,
    licenseNumber,
    contactNumber,
  });

  // Remove password from response
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;

  return res
    .status(201)
    .json(
      new ApiResponse(201, userWithoutPassword, "User registered successfully")
    );
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }

  // Find user by username
  const user = await User.findByUsername(username);
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Compare passwords
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Generate JWT token
  const token = generateToken(user);

  // Update last login time
  await User.updateLastLogin(user.id);

  // Set token as cookie (http-only for security)
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Remove password from response
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: userWithoutPassword, token },
        "Login successful"
      )
    );
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json(new ApiResponse(200, {}, "Logout successful"));
});

// Get current user profile
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Not authenticated");
  }

  // Remove password from response
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userWithoutPassword,
        "User profile retrieved successfully"
      )
    );
});

export { registerUser, loginUser, logoutUser, getCurrentUser };
