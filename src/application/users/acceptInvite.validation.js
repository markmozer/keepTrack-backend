/**
 * File: src/application/users/acceptInvite.validation.js
 */

import { v } from "../../domain/shared/validation/validators.js";
import { validatePasswordPlain } from "../../domain/security/validatePassword.js";

/**
 * @param {import("../ports/users/user.types.js").AcceptInviteUCPayload} input
 */
export function validateAcceptInvitePayload(input) {
  v.object(input, "input", {
    allowedKeys: ["tokenPlain", "passwordPlain"],
    requiredKeys: ["tokenPlain", "passwordPlain"],
  });

  const tokenPlain = v.string(input.tokenPlain, "tokenPlain");
  const passwordPlain = validatePasswordPlain(input.passwordPlain);

  return { tokenPlain, passwordPlain };
}
