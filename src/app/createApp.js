/**
 * File: src/app/createApp.js
 */

import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";

// INTERFACE imports
import { errorMiddleware } from "../interface/http/middleware/error.middleware.js";
import { responseMiddleware } from "../interface/http/middleware/response.middleware.js";
import { notFoundMiddleware } from "../interface/http/middleware/notFound.middleware.js";
import { sessionMiddleware } from "../interface/http/middleware/session.middleware.js";
import { createCorsMiddleware } from "../interface/http/middleware/cors.middleware.js";
import { createTenantResolutionMiddleware } from "../interface/http/middleware/tenantResolution.middleware.js";
import { asRequestWithContext } from "../interface/http/utils/asRequestWithContext.js";

import { buildContainer } from "./buildContainer.js";
import { registerRoutes } from "./registerRoutes.js";

/**
 * @returns {{ app: import("express").Express, shutdown: () => Promise<void> }}
 */
export function createApp() {
  const container = buildContainer();
  const { appConfig } = container;

  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());
  app.use(cookieParser());

  if (!appConfig.runtime.isTest) {
    morgan.token("host", (req) => req.headers.host || "-");
    morgan.token(
      "tenant",
      (req) => asRequestWithContext(req).context?.tenant?.slug || "-",
    );
    morgan.token(
      "user",
      (req) => asRequestWithContext(req).principal?.userId || "anon",
    );
    app.use(
      morgan(
        ":method :host (tenant :tenant) (principal :user) :url :status :response-time ms",
      ),
    );
  }


  app.use(
    sessionMiddleware(container.services.sessionService, {
      cookieName: appConfig.cookie.name,
    }),
  );

  app.use(responseMiddleware);

  app.use(createCorsMiddleware(appConfig));

  registerRoutes(app, container, {
    tenantResolutionMiddleware: createTenantResolutionMiddleware({
      tenantRepository: container.repositories.tenantRepository,
      appConfig: appConfig,
    }),
  });

  // 404 + error middleware
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return { app, shutdown: container.shutdown };
}
