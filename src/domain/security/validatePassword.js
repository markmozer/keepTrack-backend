/**
 * File: src/domain/security/validatePassword.js
 */

import { ValidationError } from "../shared/errors/index.js";

/**
 * Password policy:
 * - must be string
 * - min length 8
 * - max length 128
 * - must contain at least:
 *   - 1 lowercase
 *   - 1 uppercase
 *   - 1 number
 *
 * @param {unknown} value
 * @returns {string}
 */
export function validatePasswordPlain(value) {
  if (typeof value !== "string") {
    throw new ValidationError("password must be a string.");
  }

  // bewust GEEN trim: spaces kunnen onderdeel van password zijn
  const password = value;

  if (!password) {
    throw new ValidationError("password is required.");
  }

  if (password.length < 8) {
    throw new ValidationError("password must be at least 8 characters.");
  }

  if (password.length > 128) {
    throw new ValidationError("password must be at most 128 characters.");
  }

  if (!/[a-z]/.test(password)) {
    throw new ValidationError(
      "password must contain at least one lowercase letter."
    );
  }

  if (!/[A-Z]/.test(password)) {
    throw new ValidationError(
      "password must contain at least one uppercase letter."
    );
  }

  if (!/[0-9]/.test(password)) {
    throw new ValidationError(
      "password must contain at least one number."
    );
  }

  return password;
}
