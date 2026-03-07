/**
 * File: keepTrack-backend/src/interface/http/middleware/response.middleware.js
 */

import { AppResponse } from "../AppResponse.js";

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
