/**
 * File: src/application/provisioning/provisionTenantRoles.validation.js
 */

import { v } from "../../domain/shared/validation/validators.js";

/**
 * @param {import("../ports/provisioning/provisioning.types.js").ProvisionRolesUCPayload} input
 */
export function validateProvisionTenantRolesPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["tenantId", "now"],
    requiredKeys: ["tenantId"],
  });

  const tenantId = v.uuid(input.tenantId, "tenantId");

  let now = v.date(input.now, "timestamp", {
    nullable: true,
  });
  now = now ? now : new Date();

  return { tenantId, now };
}
