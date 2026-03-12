/**
 * File: keepTrack-backend/src/app/createApp.js
 */

import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

// INTERFACE imports
import { errorMiddleware } from "../interface/http/middleware/error.middleware.js";
import { responseMiddleware } from "../interface/http/middleware/response.middleware.js";
import { notFoundMiddleware } from "../interface/http/middleware/notFound.middleware.js";

import { buildContainer } from "./buildContainer.js";
import { createTenantController } from "../interface/http/controllers/tenant.controller.js";
import { createTenantsRouter } from "../interface/http/routers/tenants.router.js";
import { createRoleController } from "../interface/http/controllers/role.controller.js";
import { createRolesRouter } from "../interface/http/routers/roles.router.js";
import { createUserController } from "../interface/http/controllers/user.controller.js";
import { createUsersRouter } from "../interface/http/routers/users.router.js";

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

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());
  //  app.use(cookieParser());
  if (requireEnv(process.env.NODE_ENV, "NODE_ENV") !== "test") {
    app.use(morgan("dev"));
  }
  app.use(responseMiddleware);
  // app.use(
  //   cors({
  //     origin: [requireEnv(process.env.APP_BASE_URL, "NODE_ENV")],
  //   }),
  // );

  const container = buildContainer();

  // --- Controllers (Interface/http) ---
  const tenantController = createTenantController({
    createTenantUseCase: container.useCases.createTenant,
    getTenantByIdUseCase: container.useCases.getTenantById,
  });

  const roleController = createRoleController({
    createRoleUseCase: container.useCases.createRole,
  });

  const userController = createUserController({
    createUserUseCase: container.useCases.createUser,
    assignRoleToUserUseCase: container.useCases.assignRoleToUser,
  });

  // --- Routers (Interface/http) ---
  const apiRouter = express.Router();

  apiRouter.use("/tenants", createTenantsRouter({tenantController,}));
  apiRouter.use("/roles", createRolesRouter({roleController,}));
  apiRouter.use("/users", createUsersRouter({userController}));

  app.use("/api", apiRouter);

  async function shutdown() {}

  // 404 + error middleware
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return { app, shutdown };
}
