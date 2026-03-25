/**
 * File: keepTrack-backend/app.js
 */
import "dotenv/config";
import { createApp } from "./src/app/createApp.js";
import { getEnv } from "./src/shared/config/env.js";

const PORT = Number(process.env.PORT ?? 3000);

if (Number.isNaN(PORT)) {
  throw new Error("PORT must be a valid number.");
}

const nodeEnv = getEnv("NODE_ENV", "development");

const { app, shutdown } = createApp();

let server = null;

if (nodeEnv !== "test") {
  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

let isShuttingDown = false;

async function handleShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Received ${signal}, shutting down...`);

  if (!server) {
    try {
      await shutdown();
      console.log("Shutdown complete.");
    } catch (e) {
      console.error("Error during shutdown:", e);
    } finally {
      process.exit(0);
    }
    return;
  }

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
