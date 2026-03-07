/**
 * File: src/domain/errors/ValidationError.js
 */

import { AppError } from "./AppError.js";

export class ValidationError extends AppError {
  /**
   * @param {string} message
   * @param {import("./AppError.js").ErrorDetails=} details
   */
  constructor(message = "Validation error", details) {
    super({ statusCode: 400, code: "VALIDATION_ERROR", message, details });
  }
}
