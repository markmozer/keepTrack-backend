/**
 * File: src/interface/http/middleware/tenantResolution.middleware.js
 */

import { resolveTenantSlug } from "../utils/resolveTenantSlug.js";
import {
  BadRequestError,
  ResourceNotFoundError,
} from "../../../domain/shared/errors/index.js";

/**
 * @typedef {import("../../../application/ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 */

/**
 * @param {{ tenantRepository: TenantRepositoryPort }} deps
 * @returns {import("express").RequestHandler}
 */
export function createTenantResolutionMiddleware({ tenantRepository }) {
  /**
   * @param {import("../http.types.js").RequestWithContext} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  return async function tenantResolutionMiddleware(req, res, next) {
    try {
      const slug = resolveTenantSlug(req);

      if (!slug) {
        throw new BadRequestError(
          `Tenant could not be resolved from host: ${req.headers.host} .`
        );
      }

      const tenant = await tenantRepository.findBySlug(slug);

      if (!tenant) {
        throw new ResourceNotFoundError("tenant", {
          message: `Tenant not found for slug '${slug}'.`,
        });
      }

      req.context ??= {};
      req.context.tenant = {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}