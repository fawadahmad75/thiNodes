import ApiError from "../utils/ApiError.js";

// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return next(new ApiError(401, "Authentication required"));
    }
    return res.redirect("/auth/login");
  }
  next();
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.session.user) {
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return next(new ApiError(401, "Authentication required"));
    }
    return res.redirect("/auth/login");
  }

  if (req.session.user.role !== "admin") {
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return next(new ApiError(403, "Admin access required"));
    }
    return res.redirect("/");
  }

  next();
};
