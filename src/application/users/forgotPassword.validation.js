/**
 * File: src/application/users/forgotPassword.validation.js
 */


import { v } from "../../domain/shared/validation/validators.js";
import { validateUserEmail } from "../../domain/users/user.validation.js";

/**
 * @param {import("../ports/users/user.types.js").ForgotPasswordUCPayload} input
 */
export function validateForgotPasswordPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["email", "tenantId"],
    requiredKeys: ["email", "tenantId"],
  });

  v.required(input?.email, "email");
  const email = validateUserEmail(input?.email)
  const tenantId = v.uuid(input?.tenantId, "tenantId");


  return { email, tenantId };
}
