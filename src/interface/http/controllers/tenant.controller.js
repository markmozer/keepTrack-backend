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
 * @property {import("../../../application/tenants/GetTenants.js").GetTenants} getTenantsUseCase
 */

/**
 * @param {Deps} deps
 */
export function createTenantController({
  createTenantUseCase,
  getTenantByIdUseCase,
  getTenantsUseCase,
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
    /**
     * GET /api/tenants/
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
    async getTenants(req, res, next) {
      try {
        const reqWithContext = asRequestWithContext(req);
        //const body = v.object(reqWithContext.body, "body");

        const result = await getTenantsUseCase.execute({
          principal: reqWithContext.principal,
          payload: {
            pagination: {
              page: req.query.page ? Number(req.query.page) : undefined,
              pageSize: req.query.pageSize
                ? Number(req.query.pageSize)
                : undefined,
            },
            filters: {
              name:
                typeof req.query.name === "string"
                  ? req.query.name
                  : undefined,
              slug:
                typeof req.query.slug === "string"
                  ? req.query.slug
                  : undefined,
              type:
                typeof req.query.type === "string"
                  ? /** @type {any} */ (req.query.type)
                  : undefined,        
              status:
                typeof req.query.status === "string"
                  ? /** @type {any} */ (req.query.status)
                  : undefined,
            },
            sort: {
              field:
                typeof req.query.sortField === "string"
                  ? req.query.sortField
                  : undefined,
              direction:
                typeof req.query.sortDirection === "string"
                  ? /** @type {"asc"|"desc"} */ (req.query.sortDirection)
                  : undefined,
            },
          },
        });

        res.status(200).json(AppResponse.ok(result));
        return;
      } catch (e) {
        next(e);
      }
    },
  };
}
