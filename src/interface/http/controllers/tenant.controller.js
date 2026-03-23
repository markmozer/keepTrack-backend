/**
 * File: src/interface/http/controllers/tenants.controller.js
 */

import { v } from "../../../domain/shared/validation/validators.js";
import { AppResponse } from "../AppResponse.js";
import { asRequestWithContext } from "../utils/asRequestWithContext.js";

/**
 * @typedef {Object} Deps
 * @property {import("../../../application/tenants/CreateTenant.js").CreateTenant} createTenantUseCase
 * @property {import("../../../application/tenants/GetTenantById.js").GetTenantById} getTenantByIdUseCase
 */

/**
 * @param {Deps} deps
 */
export function createTenantController({
  createTenantUseCase,
  getTenantByIdUseCase,
}) {
  return {
    /**
     * POST /api/tenants
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async createTenant(req, res, next) {
      try {
        const reqWithContext = asRequestWithContext(req);
        const body = v.object(reqWithContext.body, "body");

        const tenant = await createTenantUseCase.execute({
          principal: reqWithContext.principal,
          payload: {
            name: body.name,
            slug: body.slug,
            type: body.type,
          },
        });

        res.status(201).json(AppResponse.ok(tenant));
      } catch (e) {
        next(e);
      }
    },
    /**
     * GET /api/tenants/:tenantId
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async getTenantById(req, res, next) {
      try {
        
        const reqWithContext = asRequestWithContext(req);
        const targetTenantId = reqWithContext.params.tenantId;
      
        const tenant = await getTenantByIdUseCase.execute({ 
          principal: reqWithContext.principal,
          payload: {
            targetTenantId,
          }
        });

        res.status(200).json(AppResponse.ok(tenant));
      } catch (e) {
        next(e);
      }
    },
  };
}
