/**
 * File: src/application/auth/authenticateUser.validation.js
 */


import { v } from "../../domain/shared/validation/validators.js";
import { validateUserEmail } from "../../domain/users/createUser.js";

/**
 * @param {import("../ports/auth/auth.types.js").AuthenticateUserUCPayload} input
 */
export function validateAuthenticateUserPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["tenantId", "email", "passwordPlain"],
    requiredKeys: ["tenantId", "email", "passwordPlain"],
  });

  const tenantId = v.uuid(input?.tenantId, "tenantId");
  const email = validateUserEmail(input?.email);
  const passwordPlain = v.required(input?.passwordPlain,"password");


  return { tenantId, email, passwordPlain };
}
