/**
 * File: src/application/provisioning/provisionTenantAdmin.validation.js
 */


import { v } from "../../domain/shared/validation/validators.js";
import { validateUserEmail } from "../../domain/users/createUser.js";

/**
 * @param {import("../ports/provisioning/provisioning.types.js").ProvisionTenantAdminUserUCPayload} input
 */
export function validateProvisionTenantAdminUserPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["tenantId", "email", "now"],
    requiredKeys: ["tenantId", "email"],
  });

  const tenantId = v.uuid(input.tenantId, "tenantId");
  const email = validateUserEmail(input.email);
  
  let now = v.date(input.now, "timestamp", {
    nullable: true,
  });
  now = now ? now : new Date();

  return { tenantId, email, now };
}
