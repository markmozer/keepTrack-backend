/**
 * File: src/interface/http/middleware/response.middleware.js
 */

import { AppResponse } from "../AppResponse.js";

/**
 * @param {import("../http.types.js").RequestWithContext} _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function responseMiddleware(_req, res, next) {
  res.ok = (payload, status = 200) => {
    res.status(status).json(AppResponse.ok(payload));
    return;
  };

  res.created = (payload, status = 201) => {
    res.status(status).json(AppResponse.ok(payload));
    return;
  };

  next();
}
