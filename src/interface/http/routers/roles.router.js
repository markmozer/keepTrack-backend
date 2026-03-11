/**
 * File: src/interface/http/routers/roles.router.js
 */

import express from "express";

/**
 * @param {{ roleController: any }} deps
 */
export function createRolesRouter({ roleController }) {
  const router = express.Router();

  router.post("/", roleController.createRole);


  return router;
}