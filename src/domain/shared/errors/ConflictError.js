/**
 * File: src/domain/errors/ConflictError.js
 */
import { AppError } from "./AppError.js";

export class ConflictError extends AppError {
  /**
   * @param {string} message
   * @param {import("./AppError.js").ErrorDetails=} details
   */
  constructor(message = "Conflict", details) {
    super({ statusCode: 409, code: "CONFLICT", message, details });
  }
}
