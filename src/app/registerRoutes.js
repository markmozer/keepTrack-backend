/**
 * File: src/app/registerRoutes.js
 */


import express from "express";

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
import { createTenantResolutionMiddleware } from "../interface/http/middleware/tenantResolution.middleware.js";

/**
 * @typedef {ReturnType<import("./buildContainer.js").buildContainer>} AppContainer
 */

/**
 * @param {import("express").Express} app
 * @param {AppContainer} container
 */
export function registerRoutes(app, container) {
  // --- Controllers (Interface/http) ---
  const roleController = createRoleController({
    createRoleUseCase: container.useCases.createRole,
    getRolesUseCase: container.useCases.getRoles,
  });

  const userController = createUserController({
    createUserUseCase: container.useCases.createUser,
    inviteUserUseCase: container.useCases.inviteUser,
    getUsersUseCase: container.useCases.getUsers,
    getUserByIdUseCase: container.useCases.getUserById,
  });

  const userRoleController = createUserRoleController({
    assignRoleToUserUseCase: container.useCases.assignRoleToUser,
  });

  const authController = createAuthController({
    authenticateUserUseCase: container.useCases.authenticateUser,
    getCurrentSessionUseCase: container.useCases.getCurrentSession,
    acceptInviteUseCase: container.useCases.acceptInvite,
    forgotPasswordUseCase: container.useCases.forgotPassword,
    resetPasswordUseCase: container.useCases.resetPassword,
    sessionServicePort: container.services.sessionService,
    config: container.appConfig.cookie,
  });

  const systemController = createSystemController({
    getSystemHealthUseCase: container.useCases.getSystemHealth,
  });

  // --- Routers (Interface/http) ---
  const tenantApiRouter = express.Router({ mergeParams: true });

  tenantApiRouter.use("/auth", createAuthRouter({ authController }));
  tenantApiRouter.use("/users", createUsersRouter({ userController }));
  tenantApiRouter.use("/users", createUserRolesRouter({ userRoleController }));
  tenantApiRouter.use(
    "/role-assignments",
    createUserRolesRouter({ userRoleController }),
  );
  tenantApiRouter.use("/roles", createRolesRouter({ roleController }));

  app.use("/api/system", createSystemRouter({ systemController }));
  app.use(
    "/api/t/:tenantSlug",
    createTenantResolutionMiddleware({
      tenantRepository: container.repositories.tenantRepository,
    }),
    tenantApiRouter,
  );
}
