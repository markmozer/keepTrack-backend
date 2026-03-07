/**
 * File: keepTrack-backend/src/interface/http/middleware/notFound.middleware.js
 */


import { RouteNotFoundError } from "../../../domain/shared/errors/index.js";

export function notFoundMiddleware(req, _res, next) {
  next(
    new RouteNotFoundError({
      method: req.method,
      url: req.originalUrl,
    })
  );
}