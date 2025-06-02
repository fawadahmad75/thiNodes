import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import db from "./db/index.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await db.destroy();
  server.close(() => {
    process.exit(0);
  });
});
