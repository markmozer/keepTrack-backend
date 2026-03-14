/**
 * File: src/interface/http/middleware/error.middleware.js
 */

import { AppError } from "../../../domain/shared/errors/index.js";
import { AppResponse } from "../AppResponse.js";

export function errorMiddleware(err, req, res, _next) {
  if (err instanceof AppError) {
    res
      .status(err.statusCode)
      .json(
        AppResponse.fail({
          statusCode: err.statusCode,
          code: err.code,
          message: err.message,
          details: err.details,
        })
      );
      return;
  }

  console.error("UNEXPECTED ERROR:", err);
  return res
    .status(500)
    .json(AppResponse.fail({ statusCode: 500, message: "Internal Server Error" }));
}