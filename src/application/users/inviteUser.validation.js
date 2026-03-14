/**
 * File: src/application/users/inviteUser.validation.js
 */

import { v } from "../../domain/shared/validation/validators.js";

/**
 * @typedef {Object} InviteUserPayload
 * @property {unknown} tenantId
 * @property {unknown} userId
 */

/**
 * @param {InviteUserPayload} input
 */
export function validateInviteUserInput(input) {
  v.object(input, "input", {
    allowedKeys: ["tenantId", "userId"],
    requiredKeys: ["tenantId", "userId"],
  });

  const tenantId = v.uuid(input?.tenantId, "tenantId");
  const userId = v.uuid(input?.userId, "userId");


  return { tenantId, userId };
}
