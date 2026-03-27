/**
 * File: src/application/users/requestPasswordReset.validation.js
 */


import { v } from "../../domain/shared/validation/validators.js";
import { validateUserEmail } from "../../domain/users/createUser.js";

/**
 * @param {import("../ports/users/user.types.js").RequestPasswordResetUCPayload} input
 */
export function validateRequestPasswordResetPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["email", "tenantId"],
    requiredKeys: ["email", "tenantId"],
  });

  v.required(input?.email, "email");
  const email = validateUserEmail(input?.email)
  const tenantId = v.uuid(input?.tenantId, "tenantId");


  return { email, tenantId };
}
