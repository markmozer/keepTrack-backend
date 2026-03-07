/**
 * File: src/domain/errors/InvalidCredentialsError.js
 */
import { AppError } from "./AppError.js";

export class InvalidCredentialsError extends AppError {
   /**
   * @param {string} message
   * @param {import("./AppError.js").ErrorDetails=} details
   */
  constructor(message = "Invalid credentials", details) {
    super({statusCode: 401, code: "INVALID_CREDENTIALS", message, details});
  }
}
