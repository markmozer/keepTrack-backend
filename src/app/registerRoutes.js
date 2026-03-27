/**
 * File: src/app/registerRoutes.js
 */


import express from "express";

import { createTenantController } from "../interface/http/controllers/tenant.controller.js";
import { createTenantsRouter } from "../interface/http/routers/tenants.router.js";

import { createRoleController } from "../interface/http/controllers/role.controller.js";
import { createRolesRouter } from "../interface/http/routers/roles.router.js";

import { createUserController } from "../interface/http/controllers/user.controller.js";
import { createUsersRouter } from "../interface/http/routers/users.router.js";

import { createUserRoleController } from "../interface/http/controllers/userRole.controller.js";
import { createUserRolesRouter } from "../interface/http/routers/userRoles.router.js";

import { createAuthController } from "../interface/http/controllers/auth.controller.js";
import { createAuthRouter } from "../interface/http/routers/auth.router.js";

import { createSystemController } from "../interface/http/controllers/system.controller.js";
import { createSystemRouter } from "../interface/http/routers/system.router.js";

/**
 * @typedef {ReturnType<import("./buildContainer.js").buildContainer>} AppContainer
 */

/**
 * @param {import("express").Express} app
 * @param {AppContainer} container
 */
export function registerRoutes(app, container) {
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
    inviteUserUseCase: container.useCases.inviteUser,
    acceptInviteUseCase: container.useCases.acceptInvite,
    requestPasswordResetUseCase: container.useCases.requestPasswordReset,
  });

  const userRoleController = createUserRoleController({
    assignRoleToUserUseCase: container.useCases.assignRoleToUser,
  });

  const authController = createAuthController({
    authenticateUserUseCase: container.useCases.authenticateUser,
    sessionServicePort: container.services.sessionService,
    config: container.appConfig.cookie,
  });

  const systemController = createSystemController({
    getSystemHealthUseCase: container.useCases.getSystemHealth,
  });

  // --- Routers (Interface/http) ---
  const apiRouter = express.Router();


  apiRouter.use("/tenants", createTenantsRouter({ tenantController }));
  apiRouter.use("/roles", createRolesRouter({ roleController }));
  apiRouter.use("/users", createUsersRouter({ userController }));
  apiRouter.use("/users", createUserRolesRouter({ userRoleController }));
  apiRouter.use("/auth",  createAuthRouter({ authController }));
  apiRouter.use("/system", createSystemRouter({systemController}));

  app.use("/api", apiRouter);
}