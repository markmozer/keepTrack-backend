/**
 * File: src/interface/http/routers/userRoles.router.js
 */


import express from "express";

/**
 * @param {{ userRoleController: any }} deps
 */
export function createUserRolesRouter({ userRoleController }) {
  const router = express.Router();

  router.post("/:userId/roles", userRoleController.assignRoleToUser);

  return router;
}
