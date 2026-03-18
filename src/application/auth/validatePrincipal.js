/**
 * File: keepTrack-backend/src/application/auth/validatePrincipal.js
 */

import { v } from "../../domain/shared/validation/validators.js";
import { ValidationError } from "../../domain/shared/errors/index.js";

/**
 * @param {unknown} input
 * @returns {import("../ports/auth/auth.types.js").AuthenticatedUserDto}
 */
export function validatePrincipal(input) {
  const obj = v.object(input, "principal");

  const userId = v.uuid(obj.userId, "principal.userId");
  const tenantId = v.uuid(obj.tenantId, "principal.tenantId");

  if (!Array.isArray(obj.roleNames)) {
    throw new ValidationError("principal.roles must be an array");
  }

  const roleNames = obj.roleNames;

  return {
    userId,
    tenantId,
    status: obj.status,
    roleNames,
  };
}
