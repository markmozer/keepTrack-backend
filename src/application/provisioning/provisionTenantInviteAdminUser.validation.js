/**
 * File: src/application/provisioning/provisionTenantInviteAdminUser.validation.js
 */

import { v } from "../../domain/shared/validation/validators.js";

/**
 * @param {import("../ports/provisioning/provisioning.types.js").ProvisionTenantInviteAdminUserUCPayload} input
 */
export function validateProvisionTenantInviteAdminUserPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["tenantId", "userId", "now"],
    requiredKeys: ["tenantId", "userId"],
  });

  const tenantId = v.uuid(input.tenantId, "tenantId");
  const userId = v.uuid(input.userId, "userId")
  
  let now = v.date(input.now, "timestamp", {
    nullable: true,
  });
  now = now ? now : new Date();

  return { tenantId, userId, now };
}
