/**
 * File: src/domain/errors/RouteNotFoundError.js
 */


import { AppError } from "./AppError.js";

export class RouteNotFoundError extends AppError {
      /**
   * @param {string} message
   * @param {import("./AppError.js").ErrorDetails=} details
   */
  constructor(message = "Route not found", details) {
    super({statusCode: 404, code: "ROUTE_NOT_FOUND", message, details});
  }
}
