/**
 * File: src/interface/http/routers/auth.router.js
 */

import express from "express";
import {requireAuth} from "../middleware/requireAuth.middleware.js";
import {requireTenantMiddleware} from "../middleware/requireTenant.middleware.js";

/**
 * @param {{ authController: any }} deps
 */
export function createAuthRouter({ authController }) {
  const router = express.Router();

  router.post(
    "/login",
    requireTenantMiddleware,
    authController.authenticateUser,
  );
  router.get("/me", requireTenantMiddleware, requireAuth, authController.me);
  router.post("/logout", requireTenantMiddleware, authController.logout);
  router.post(
    "/accept-invite",
    requireTenantMiddleware,
    authController.acceptInvite,
  );
  router.post(
    "/forgot-password",
    requireTenantMiddleware,
    authController.requestPasswordReset,
  );
  router.post(
    "/reset-password",
    requireTenantMiddleware,
    authController.resetPassword,
  );

  return router;
}
