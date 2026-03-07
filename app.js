/**
 * File: keepTrack-backend/app.js
 */
import "dotenv/config";
import { createApp } from "./src/app/createApp.js";

const PORT = process.env.PORT || 3000;
const { app, shutdown } = createApp();

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

let isShuttingDown = false;

async function handleShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Received ${signal}, shutting down...`);

  // Stop accepting new connections
  server.close(async (err) => {
    if (err) console.error("Error closing server:", err);

    try {
      await shutdown();
      console.log("Shutdown complete.");
    } catch (e) {
      console.error("Error during shutdown:", e);
    } finally {
      process.exit(err ? 1 : 0);
    }
  });
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));