/**
 * File: src/interface/http/routers/users.router.js
 */

import express from "express";
import {requireAuth} from "../middleware/requireAuth.middleware.js"

/**
 * @param {{ userController: any }} deps
 */
export function createUsersRouter({ userController }) {
  const router = express.Router();

  router.post("/", requireAuth, userController.createUser);
  router.post("/:userId/invite", requireAuth, userController.inviteUser);
  router.post("/accept-invite", userController.acceptInvite)

  return router;
}
