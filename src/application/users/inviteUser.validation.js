/**
 * File: src/application/users/inviteUser.validation.js
 */

import { v } from "../../domain/shared/validation/validators.js";

/**
 * @param {import("../ports/users/user.types.js").InviteUserUCPayload} input
 */
export function validateInviteUserPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["targetUserId"],
    requiredKeys: ["targetUserId"],
  });

  const targetUserId = v.uuid(input?.targetUserId, "targetUserId");


  return { targetUserId };
}
