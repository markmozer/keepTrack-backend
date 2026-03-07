/**
 * File: src/domain/errors/NoValidRolesError.js
 */

import { AppError } from "./AppError.js";

export class NoValidRolesError extends AppError {
    /**
   * @param {string} message
   * @param {import("./AppError.js").ErrorDetails=} details
   */
  constructor(message = "No valid roles", details) {
    super({ statusCode: 403, code: "NO_VALID_ROLES", message, details});
  }
}
