// Session-based authentication middleware

// Middleware to check if user is authenticated using session
export const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect("/auth/login");
};

// Middleware to check if user is NOT authenticated
export const isNotAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  res.redirect("/dashboard");
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  res.status(403).render("errors/error", {
    title: "Access Denied",
    message: "Admin privileges required",
    status: 403,
  });
};
