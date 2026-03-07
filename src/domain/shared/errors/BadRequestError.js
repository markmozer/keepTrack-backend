/**
 * File: src/domain/errors/BadRequestError.js
 */
import { AppError } from "./AppError.js";

export class BadRequestError extends AppError {
  /**
   * @param {string} message
   * @param {import("./AppError.js").ErrorDetails=} details
   */
  constructor(message = "Bad request", details) {
    super({ statusCode: 400, code: "BAD_REQUEST", message, details });
  }
}
