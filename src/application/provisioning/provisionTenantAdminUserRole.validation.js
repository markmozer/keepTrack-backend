/**
 * File: src/application/provisioning/provisionTenantAdmin.validation.js
 */


import { v } from "../../domain/shared/validation/validators.js";

/**
 * @param {import("../ports/provisioning/provisioning.types.js").ProvisionTenantAdminUserRoleUCPayload} input
 */
export function validateProvisionTenantAdminUserRolePayload(input) {
  v.object(input, "input", {
    allowedKeys: ["tenantId", "userId", "roleName", "now"],
    requiredKeys: ["tenantId", "userId", "roleName"],
  });

  const tenantId = v.uuid(input.tenantId, "tenantId");
  const userId = v.uuid(input.userId, "userId");
  const roleName = v.string(input.roleName, "roleName");
    
  let now = v.date(input.now, "timestamp", {
    nullable: true,
  });
  now = now ? now : new Date();

  return { tenantId, userId, roleName, now };
}
