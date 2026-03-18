/**
 * File: src/interface/http/middleware/requireAuth.middleware.js
 */


import { UnauthorizedError } from "../../../domain/shared/errors/index.js";

/**
 * @param {import("../http.types.js").RequestWithContext} req
 * @param {import("express").Response} _res
 * @param {import("express").NextFunction} next
 */
export function requireAuth(req, _res, next) {
  try {
    if (!req.principal) {
      throw new UnauthorizedError("Authentication required.");
    }

    if ( !req.context?.tenant?.id || req.context.tenant.id !== req.principal.tenantId ) {
        throw new UnauthorizedError("Authentication required (tenantId conflict).");
    }

    next();
  } catch (err) {
    next(err);
  }
}