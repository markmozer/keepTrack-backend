/**
 * File: src/interface/http/routers/userRoles.router.js
 */


import express from "express";
import {requireAuth} from "../middleware/requireAuth.middleware.js"

/**
 * @param {{ userRoleController: any }} deps
 */
export function createUserRolesRouter({ userRoleController }) {
  const router = express.Router();

  router.post("/:userId/roles",requireAuth, userRoleController.assignRoleToUser);

  return router;
}
