/**
 * File: src/application/provisioning/provisionBaseTenant.validation.js
 */


import { v } from "../../domain/shared/validation/validators.js";
import {
  validateTenantName,
  validateTenantSlug,
} from "../../domain/tenants/createTenant.js";
import { validateUserEmail } from "../../domain/users/createUser.js";


/**
 * @param {import("../ports/provisioning/provisioning.types.js").ProvisionBaseTenantUCPayload} input
 */
export function validateProvisionBaseTenantPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["name", "slug", "adminEmail"],
    requiredKeys: ["name", "slug", "adminEmail"],
  });

  const name = validateTenantName(input?.name);
  const slug = validateTenantSlug(input?.slug);
  const adminEmail = validateUserEmail(input?.adminEmail)

  return { name, slug, adminEmail };
}
