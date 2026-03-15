/**
 * File: src/interface/http/routers/users.router.js
 */

import express from "express";

/**
 * @param {{ userController: any }} deps
 */
export function createUsersRouter({ userController }) {
  const router = express.Router();

  router.post("/", userController.createUser);
  router.post("/:userId/invite", userController.inviteUser);
  router.post("/accept-invite", userController.acceptInvite)

  return router;
}
