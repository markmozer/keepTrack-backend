/**
 * File: src/application/users/inviteUser.validation.js
 */

import { v } from "../../domain/shared/validation/validators.js";

/**
 * @param {import("../ports/session/session.types.js").GetCurrentSessionUCPayload} input
 */
export function validateGetCurrentSessionPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["userId", "tenantId"],
    requiredKeys: ["userId", "tenantId"],
  });

  const userId = v.uuid(input?.userId, "userId");
  const tenantId = v.uuid(input?.tenantId, "tenantId");


  return { userId, tenantId };
}
