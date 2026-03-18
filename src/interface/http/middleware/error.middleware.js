/**
 * File: src/interface/http/middleware/error.middleware.js
 */

// @ts-nocheck

import { AppError } from "../../../domain/shared/errors/index.js";
import { AppResponse } from "../AppResponse.js";

    /**
     * @param {import("../../../domain/shared/errors/AppError.js").AppError} err
     * @param {import("../http.types.js").RequestWithContext} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} _next
     */
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
          name: err.name,
          isOperational: err.isOperational,
        })
      );
      return;
  }

  console.error("UNEXPECTED ERROR:", err);
  res
    .status(500)
    .json(AppResponse.fail({ statusCode: 500, message: "Internal Server Error" }));
    return;
}