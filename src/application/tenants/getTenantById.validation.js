/**
 * File: src/application/tenants/getTenantById.validation.js
 */


import { v } from "../../domain/shared/validation/validators.js";


/**
 * @param {import("../ports/tenants/tenant.types.js").GetTenantByIdUCPayload} input
 */
export function validateGetTenantByIdPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["targetTenantId"],
    requiredKeys: ["targetTenantId"],
  });

  const targetTenantId = v.uuid(input.targetTenantId, "targetTenantId");

  return { targetTenantId };
}
