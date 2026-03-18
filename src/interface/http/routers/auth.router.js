/**
 * File: src/interface/http/routers/auth.router.js
 */

import express from "express";
import {requireAuth} from "../middleware/requireAuth.middleware.js"

/**
 * @param {{ authController: any }} deps
 */
export function createAuthRouter({ authController }) {
  const router = express.Router();

  router.post("/login", authController.authenticateUser);
  router.get("/me", requireAuth, authController.me);
  router.post("/logout", authController.logout);

  return router;
}
