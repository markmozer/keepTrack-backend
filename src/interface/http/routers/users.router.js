/**
 * File: src/interface/http/routers/users.router.js
 */

import express from "express";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { requireTenantMiddleware } from "../middleware/requireTenant.middleware.js";

/**
 * @param {{ userController: any }} deps
 */
export function createUsersRouter({ userController }) {
  const router = express.Router();

  router.post(
    "/",
    requireTenantMiddleware,
    requireAuth,
    userController.createUser,
  );
  router.post(
    "/:userId/invite",
    requireTenantMiddleware,
    requireAuth,
    userController.inviteUser,
  );
  router.post(
    "/accept-invite",
    requireTenantMiddleware,
    userController.acceptInvite,
  );
  router.post(
    "/forgot-password",
    requireTenantMiddleware,
    userController.requestPasswordReset,
  );
  router.post(
    "/reset-password",
    requireTenantMiddleware,
    userController.resetPassword,
  );
  router.get(
    "/",
    requireTenantMiddleware,
    requireAuth,
    userController.getUsers,
  );
  router.get(
    "/:userId",
    requireTenantMiddleware,
    requireAuth,
    userController.getUserById,
  );

  return router;
}
