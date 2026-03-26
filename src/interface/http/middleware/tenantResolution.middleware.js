/**
 * File: src/interface/http/middleware/tenantResolution.middleware.js
 */

import { ResourceNotFoundError } from "../../../domain/shared/errors/index.js";

/**
 * @typedef {import("../../../application/ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 */

/**
 * Resolves tenant context from request headers.
 *
 * Behavior:
 * - if tenant is already present on req.context, do nothing
 * - if no tenant slug is provided, do nothing
 * - if a tenant slug is provided but no tenant exists, throw
 * - if a tenant slug is provided and found, set req.context.tenant
 *
 * @param {Object} deps
 * @param {TenantRepositoryPort} deps.tenantRepository
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
      if (req.context?.tenant) {
        return next();
      }

      const rawSlug = req.header("X-Tenant-Slug");
      const slug = typeof rawSlug === "string" ? rawSlug.trim() : "";

      if (!slug) {
        return next();
      }

      const tenant = await tenantRepository.findBySlug( slug );

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

      return next();
    } catch (error) {
      return next(error);
    }
  };
}