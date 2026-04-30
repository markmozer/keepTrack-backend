/**
 * File: keepTrack-backend/src/domain/users/user.validation.js
 */


import { ValidationError } from "../shared/errors/index.js";

/**
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmailFormat(email) {
  const re =
    /^\s*[\w\-+_]+(\.[\w\-+_]+)*@[\w\-+_]+\.[\w\-+_]+(\.[\w\-+_]+)*\s*$/;
  return re.test(email);
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function validateUserEmail(value) {
  if (typeof value !== "string") {
    throw new ValidationError("User email must be a string.");
  }

  const normalizedEmail = value.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new ValidationError("User email is required.");
  }

  if (!isValidEmailFormat(normalizedEmail)) {
    throw new ValidationError("User email is incorrectly formatted.", {
      email: normalizedEmail,
    });
  }

  return normalizedEmail;
}