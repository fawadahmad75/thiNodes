import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get all users (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll();

  // Remove passwords from response
  const usersWithoutPasswords = users.map((user) => {
    const userObject = { ...user };
    delete userObject.password;
    return userObject;
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        usersWithoutPasswords,
        "Users retrieved successfully"
      )
    );
});

// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Remove password from response
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;

  return res
    .status(200)
    .json(
      new ApiResponse(200, userWithoutPassword, "User retrieved successfully")
    );
});

// Update user (admin can update any user, users can only update themselves)
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
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

  // Check if user exists
  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  // Security: Check if user is updating their own profile or is admin
  if (req.user.id.toString() !== id && req.user.role !== "admin") {
    throw new ApiError(
      403,
      "Unauthorized: You can only update your own profile"
    );
  }

  // Security: Only admins can change roles
  if (role && req.user.role !== "admin") {
    throw new ApiError(403, "Unauthorized: Only admins can change roles");
  }

  // Check if username already exists (if being updated)
  if (username && username !== existingUser.username) {
    const userWithSameUsername = await User.findByUsername(username);
    if (userWithSameUsername) {
      throw new ApiError(400, "Username already exists");
    }
  }

  // Prepare update data
  const updateData = {};
  if (username) updateData.username = username;
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (role && req.user.role === "admin") updateData.role = role;
  if (specialization) updateData.specialization = specialization;
  if (licenseNumber) updateData.licenseNumber = licenseNumber;
  if (contactNumber) updateData.contactNumber = contactNumber;

  // Hash password if it's being updated
  if (password) {
    const saltRounds = 10;
    updateData.password = await bcrypt.hash(password, saltRounds);
  }

  // Update user
  const updatedUser = await User.update(id, updateData);

  // Remove password from response
  const userWithoutPassword = { ...updatedUser };
  delete userWithoutPassword.password;

  return res
    .status(200)
    .json(
      new ApiResponse(200, userWithoutPassword, "User updated successfully")
    );
});

// Delete user (admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if user exists
  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  // Delete user
  await User.delete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

export { getAllUsers, getUserById, updateUser, deleteUser };
