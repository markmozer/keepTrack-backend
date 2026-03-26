/**
 * File: src/interface/http/routers/tenants.router.js
 */


import express from "express";
import {requireAuth} from "../middleware/requireAuth.middleware.js";
import {requireTenantMiddleware} from "../middleware/requireTenant.middleware.js";

/**
 * @param {{ tenantController: any }} deps
 */
export function createTenantsRouter({ tenantController }) {
  const router = express.Router();

  router.post("/", requireAuth, tenantController.createTenant);
  router.get("/:tenantId", requireTenantMiddleware, requireAuth, tenantController.getTenantById);

  return router;
}