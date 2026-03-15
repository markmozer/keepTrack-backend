/**
 * File: src/application/userRoles/assignRoleToUser.validation.js
 */


import { ValidationError } from "../../domain/shared/errors/ValidationError.js";
import { v } from "../../domain/shared/validation/validators.js";

/**
 * @param {import("../ports/userRoles/userRole.types.js").AssignRoleToUserUCPayload} input
 */
export function validateAssignRoleToUserPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["targetUserId", "roleId", "validFrom", "validTo"],
    requiredKeys: ["targetUserId", "roleId"],
  });

  const targetUserId = v.uuid(input?.targetUserId, "targetUserId");
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

  return { targetUserId, roleId, validFrom, validTo };
}
