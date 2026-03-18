/**
 * File: src/interface/http/routers/roles.router.js
 */

import express from "express";
import {requireAuth} from "../middleware/requireAuth.middleware.js"

/**
 * @param {{ roleController: any }} deps
 */
export function createRolesRouter({ roleController }) {
  const router = express.Router();

  router.post("/",requireAuth, roleController.createRole);


  return router;
}