/**
 * File: src/domain/errors/UnauthorizedError.js
 */
import { AppError } from "./AppError.js";

export class UnauthorizedError extends AppError {
  /**
   * @param {string} message
   * @param {import("./AppError.js").ErrorDetails=} details
   */
  constructor(message = "Unauthorized", details) {
    super({ statusCode: 401, code: "UNAUTHORIZED", message, details });
  }
}
