/**
 * File: src/application/users/createUser.validation.js
 */
import { v } from "../../domain/shared/validation/validators.js";
import {
  validateUserEmail,
} from "../../domain/users/createUser.js";


/**
 * @typedef {Object} CreateUserPayload
 * @property {unknown} tenantId
 * @property {unknown} email
 */

/**
 * @param {CreateUserPayload} input
 */
export function validateCreateUserInput(input) {
  v.object(input, "input", {
    allowedKeys: ["tenantId", "email"],
    requiredKeys: ["tenantId", "email"],
  });

  const tenantId = v.uuid(input?.tenantId, "tenantId");
  const email = validateUserEmail(input?.email);


  return { tenantId, email };
}
