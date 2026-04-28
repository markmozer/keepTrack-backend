/**
 * File: src/domain/shared/errors/RolesNotYetActiveError.js
 */

import { AppError } from "./AppError.js";

export class RolesNotYetActiveError extends AppError {
  /**
   * @param {string} message
   * @param {import("./AppError.js").ErrorDetails=} details
   */
  constructor(message = "Roles are not yet active", details) {
    super({
      statusCode: 403,
      code: "ROLES_NOT_YET_ACTIVE",
      message,
      details,
    });
  }
}
