/**
 * File: src/app/createApp.js
 */

import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

// INTERFACE imports
import { errorMiddleware } from "../interface/http/middleware/error.middleware.js";
import { responseMiddleware } from "../interface/http/middleware/response.middleware.js";
import { notFoundMiddleware } from "../interface/http/middleware/notFound.middleware.js";
import { sessionMiddleware } from "../interface/http/middleware/session.middleware.js";
import { createTenantResolutionMiddleware } from "../interface/http/middleware/tenantResolution.middleware.js";

import { buildContainer } from "./buildContainer.js";
import { registerRoutes } from "./registerRoutes.js";

/**
 * @param {string | undefined} value
 * @param {string} name
 * @returns {string}
 */
function requireEnv(value, name) {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

/**
 * @returns {{ app: import("express").Express, shutdown: () => Promise<void> }}
 */
export function createApp() {
  const app = express();
  const container = buildContainer();

  app.disable("x-powered-by");
  app.use(express.json());
  app.use(cookieParser());

  if (requireEnv(process.env.NODE_ENV, "NODE_ENV") !== "test") {
    app.use(morgan("dev"));
  }
  
  app.use(
    sessionMiddleware(container.services.sessionService, {
      cookieName: process.env.SESSION_COOKIE_NAME ?? "sid",
    }),
  );

  app.use(responseMiddleware);

  app.use(
    cors({
      origin: [requireEnv(process.env.APP_BASE_URL, "APP_BASE_URL")],
      credentials: true,
    }),
  );

  registerRoutes(app, container, {
    tenantResolutionMiddleware: createTenantResolutionMiddleware({
      tenantRepository: container.repositories.tenantRepository,
    }),
  });

  // 404 + error middleware
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return { app, shutdown: container.shutdown };
}
