/**
 * File: src/interface/http/routers/tenants.router.js
 */


import express from "express";

/**
 * @param {{ tenantController: any }} deps
 */
export function createTenantsRouter({ tenantController }) {
  const router = express.Router();

  router.post("/", tenantController.createTenant);
  router.get("/:tenantId", tenantController.getTenantById);

  return router;
}