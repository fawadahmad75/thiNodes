import { User } from "../../models/index.js";
import { Department } from "../../models/index.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";

class UserViewController {
  // List all users (admin only)
  index = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    const users = await User.findAll({
      offset,
      limit,
      orderBy: "created_at",
      orderDirection: "DESC",
    });

    const totalUsers = await User.countAll();
    const totalPages = Math.ceil(totalUsers / limit);

    res.render("users/index", {
      title: "User Management",
      active: "users",
      users,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
    });
  });

  // Show new user form (admin only)
  new = asyncHandler(async (req, res) => {
    const departments = await Department.findAll({
      orderBy: "name",
      orderDirection: "ASC",
    });

    res.render("users/new", {
      title: "Add New User",
      active: "users",
      departments,
    });
  });

  // Create new user (admin only)
  create = asyncHandler(async (req, res) => {
    const { name, email, password, role, department_ids } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).render("users/new", {
        title: "Add New User",
        active: "users",
        departments: await Department.findAll({ orderBy: "name" }),
        error: "All fields are required",
        formData: req.body,
      });
    }

    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).render("users/new", {
        title: "Add New User",
        active: "users",
        departments: await Department.findAll({ orderBy: "name" }),
        error: "Email already exists",
        formData: req.body,
      });
    }

    // Create user
    const userData = {
      name,
      email,
      password, // Will be hashed in the model
      role,
      department_ids: department_ids
        ? Array.isArray(department_ids)
          ? department_ids
          : [department_ids]
        : [],
    };

    const newUser = await User.create(userData);

    req.session.message = {
      type: "success",
      text: `User ${newUser.name} created successfully`,
    };
    res.redirect("/users");
  });

  // Show user details (admin only)
  show = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.render("users/show", {
      title: `User: ${user.name}`,
      active: "users",
      user,
    });
  });

  // Show edit user form (admin only)
  edit = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const departments = await Department.findAll({
      orderBy: "name",
      orderDirection: "ASC",
    });

    res.render("users/edit", {
      title: `Edit User: ${user.name}`,
      active: "users",
      user,
      departments,
    });
  });

  // Update user (admin only)
  update = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { name, email, role, department_ids, status } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Check if email is taken by another user
    if (email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).render("users/edit", {
          title: `Edit User: ${user.name}`,
          active: "users",
          user,
          departments: await Department.findAll({ orderBy: "name" }),
          error: "Email already exists",
        });
      }
    }

    const updateData = {
      name,
      email,
      role,
      department_ids: department_ids
        ? Array.isArray(department_ids)
          ? department_ids
          : [department_ids]
        : [],
      status: status || "active",
    };

    const updatedUser = await User.update(userId, updateData);

    req.session.message = {
      type: "success",
      text: `User ${updatedUser.name} updated successfully`,
    };
    res.redirect("/users");
  });

  // Delete user (admin only)
  delete = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    // Don't allow deleting self
    if (userId === req.session.user.id) {
      req.session.message = {
        type: "error",
        text: "You cannot delete your own account",
      };
      return res.redirect("/users");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await User.delete(userId);

    req.session.message = {
      type: "success",
      text: `User ${user.name} deleted successfully`,
    };
    res.redirect("/users");
  });
}

export default UserViewController;
