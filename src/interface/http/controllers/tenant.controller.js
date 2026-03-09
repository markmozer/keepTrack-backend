/**
 * File: keepTrack-backend/src/interface/http/controllers/tenants.controller.js
 */

import { BadRequestError } from "../../../domain/shared/errors/index.js";
import { AppResponse } from "../AppResponse.js";

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
        const body = req.body;

        if (!body || typeof body !== "object" || Array.isArray(body)) {
          throw new BadRequestError("Body must be a JSON object.");
        }

        const { name, slug, status } = body;

        const tenant = await createTenantUseCase.execute({
          name,
          slug,
          status,
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
        const { tenantId } = req.params;

        const tenant = await getTenantByIdUseCase.execute({tenantId});

        res.status(200).json(AppResponse.ok(tenant));
      } catch (e) {
        next(e);
      }
    },
  };
}
