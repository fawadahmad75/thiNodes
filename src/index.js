import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import db from "./db/index.js";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Network access: Available on your local network`);
  console.log(`Local access: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await db.destroy();
  server.close(() => {
    process.exit(0);
  });
});
