/**
 * File: src/domain/errors/ForbiddenError.js
 */
import { AppError } from "./AppError.js";

export class ForbiddenError extends AppError {
  /**
   * @param {string} message
   * @param {import("./AppError.js").ErrorDetails=} details
   */
  constructor(message = "Forbidden", details) {
    super({ statusCode: 403, code: "FORBIDDEN", message, details });
  }
}
