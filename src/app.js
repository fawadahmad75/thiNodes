import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import session from "express-session";
import expressEjsLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";
import db from "./db/index.js"; // Your Knex instance
import ApiError from "./utils/ApiError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressEjsLayouts);
app.set("layout", "layouts/main");

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Session configuration
app.use(
  session({
    secret: process.env.JWT_SECRET_KEY || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Static files
app.use(express.static(path.join(__dirname, "../public")));

// Make common data available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.active = null; // Default value for active navigation
  next();
});

// API Routes
app.use(routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).render("errors/404", {
    title: "Page Not Found",
    layout: "layouts/error",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // If API request, send JSON response
  if (req.xhr || req.headers.accept.indexOf("json") > -1) {
    return res.status(statusCode).json({
      success: false,
      statusCode: statusCode,
      message: message,
      stack: process.env.NODE_ENV === "development" ? err.stack : {},
    });
  }

  // For regular requests, render error page
  res.status(statusCode).render("errors/error", {
    title: "Error",
    message: message,
    layout: "layouts/error",
    stack: process.env.NODE_ENV === "development" ? err.stack : "",
  });
});

// Export the configured app
export default app;
