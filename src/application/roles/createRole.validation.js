/**
 * File: src/application/roles/createRole.validation.js
 */
import { v } from "../../domain/shared/validation/validators.js";
import {
  validateRoleName,
} from "../../domain/roles/createRole.js";

/**
 * @typedef {Object} CreateRolePayload
 * @property {unknown} tenantId
 * @property {unknown} name
 */

/**
 * @param {CreateRolePayload} input
 */
export function validateCreateRolePayload(input) {
  v.object(input, "input", {
    allowedKeys: ["name"],
    requiredKeys: ["name"],
  });

  const name = validateRoleName(input?.name);


  return { name };
}

