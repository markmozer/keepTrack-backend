/**
 * File: keepTrack-backend/src/application/auth/validatePrincipal.js
 */


import { v } from "../../domain/shared/validation/validators.js";
import { ValidationError } from "../../domain/shared/errors/index.js";

/**
 * @param {unknown} input
 * @returns {import("../ports/auth/auth.types").Principal}
 */
export function validatePrincipal(input) {
  const obj = v.object(input, "principal");

  const userId = v.string(obj.userId, "principal.userId", { trim: true, min: 1 });
  const tenantId = v.uuid(obj.tenantId, "principal.tenantId");

  if (!Array.isArray(obj.roles)) {
    throw new ValidationError("principal.roles must be an array");
  }

  const roles = obj.roles.map((role, index) =>
    v.string(role, `principal.roles[${index}]`, { trim: true, min: 1 })
  );

  return {
    userId,
    tenantId,
    roles,
  };
}