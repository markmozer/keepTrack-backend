/**
 * File: src/interface/http/middleware/notFound.middleware.js
 */

// @ts-nocheck

import { RouteNotFoundError } from "../../../domain/shared/errors/index.js";

/**
 * @param {import("../http.types.js").RequestWithContext} req
 * @param {import("express").Response} _res
 * @param {import("express").NextFunction} next
 */
export function notFoundMiddleware(req, _res, next) {
  next(
    new RouteNotFoundError({
      method: req.method,
      url: req.originalUrl,
    }),
  );
}
