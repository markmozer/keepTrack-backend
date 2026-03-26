/**
 * File: src/interface/http/middleware/requireTenant.middleware.js
 */

import { BadRequestError } from "../../../domain/shared/errors/index.js";

/**
 * @param {import("../http.types.js").RequestWithContext} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function requireTenantMiddleware(req, res, next) {
  if (!req.context?.tenant?.id) {
    return next(new BadRequestError("Tenant is required for this route."));
  }

  return next();
}