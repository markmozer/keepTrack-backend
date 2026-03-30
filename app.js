/**
 * File: app.js
 */

import "dotenv/config";
import { loadAppConfig } from "./src/app/config/appConfig.js";
import { createApp } from "./src/app/createApp.js";

const appConfig = loadAppConfig();

const port = appConfig.express.port;

const { app, container } = await createApp({appConfig});

const shutdown = container.shutdown;

let server = null;

if (!appConfig.runtime.isTest) {
  server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
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
