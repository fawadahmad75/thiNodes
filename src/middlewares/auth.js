import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import ApiError from "../utils/ApiError.js";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key-for-jwt";

// Middleware to authenticate user using JWT
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, "Invalid or expired token");
    }

    // Track user's last login (update in database)
    await User.updateLastLogin(user.id);

    // Attach user to request for further use
    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, "Authentication failed: " + error.message));
  }
};

// Middleware to check admin role
export const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      throw new ApiError(403, "Access denied: Admin privileges required");
    }
  } catch (error) {
    next(new ApiError(403, "Access denied: " + error.message));
  }
};

// Utility function to generate JWT
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    SECRET_KEY,
    { expiresIn: "24h" }
  );
};
