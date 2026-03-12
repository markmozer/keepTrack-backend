/**
 * File: src/application/userRoles/assignRoleToUser.validation.js
 */


import { ValidationError } from "../../domain/shared/errors/ValidationError.js";
import { v } from "../../domain/shared/validation/validators.js";

/**
 * @typedef {Object} AssignRoleToUserPayload
 * @property {unknown} tenantId
 * @property {unknown} userId
 * @property {unknown} roleId
 * @property {unknown} validFrom
 * @property {unknown} validTo
 */

/**
 * @param {AssignRoleToUserPayload} input
 */
export function validateAssignRoleToUserInput(input) {
  v.object(input, "input", {
    allowedKeys: ["tenantId", "userId", "roleId", "validFrom", "validTo"],
    requiredKeys: ["tenantId", "userId", "roleId"],
  });

  const tenantId = v.uuid(input?.tenantId, "tenantId");
  const userId = v.uuid(input?.userId, "userId");
  const roleId = v.uuid(input?.roleId, "roleId");
  const resolvedValidFrom = v.date(input?.validFrom, "validFrom", {
    nullable: true,
    emptyAsNull: true,
  });
  const resolvedValidTo = v.date(input?.validTo, "validTo", {
    nullable: true,
    emptyAsNull: true,
  });

  const validFrom = resolvedValidFrom ? resolvedValidFrom : new Date();
  const validTo = resolvedValidTo ? resolvedValidTo : null;

  if (validTo && validTo.getTime() <= validFrom.getTime()) {
    throw new ValidationError("validTo must be after validFrom", {
      validFrom: validFrom.toISOString(),
      validTo: validTo.toISOString(),
    });
  }

  return { tenantId, userId, roleId, validFrom, validTo };
}
