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
export function validateCreateRoleInput(input) {
  v.object(input, "input", {
    allowedKeys: ["tenantId", "name"],
    requiredKeys: ["tenantId", "name"],
  });

  const tenantId = v.uuid(input?.tenantId, "tenantId");
  const name = validateRoleName(input?.name);


  return { tenantId, name };
}

