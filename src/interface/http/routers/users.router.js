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
  router.post("/:userId/roles", userController.assignRoleToUser);
  router.post("/:userId/invite", userController.inviteUser);

  return router;
}
