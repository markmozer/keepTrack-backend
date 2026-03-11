/**
 * File: src/domain/roles/createRole.js
 */

import { ValidationError } from "../shared/errors/index.js";


/**
 * @param {unknown} value
 * @returns {string}
 */
export function validateRoleName(value) {
  if (typeof value !== "string") {
    throw new ValidationError("Role name must be a string.");
  }

  const name = value.trim();

  if (!name) {
    throw new ValidationError("Role name is required.");
  }

  if (name.length < 2) {
    throw new ValidationError("Role name must be at least 2 characters.");
  }

  if (name.length > 32) {
    throw new ValidationError("Role name must be at most 32 characters.");
  }

  if (name !== name.toUpperCase()) {
    throw new ValidationError("Role name must be uppercase.");
  }

  if (!/^[A-Z0-9_]+$/.test(name)) {
    throw new ValidationError(
      "Role name may only contain uppercase letters, numbers, and underscore."
    );
  }

  if (name.startsWith("_") || name.endsWith("_")) {
    throw new ValidationError(
      "Role name may not start or end with an underscore."
    );
  }

  if (name.includes("__")) {
    throw new ValidationError(
      "Role name may not contain consecutive underscores."
    );
  }

  return name;
}