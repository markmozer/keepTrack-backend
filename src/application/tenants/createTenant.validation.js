/**
 * File: src/application/tenants/createTenant.validation.js
 */

import { v } from "../../domain/shared/validation/validators.js";
import {
  validateTenantName,
  validateTenantSlug,
} from "../../domain/tenants/createTenant.js";


/**
 * @param {import("../ports/tenants/tenant.types.js").CreateTenantUCPayload} input
 */
export function validateCreateTenantPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["name", "slug"],
    requiredKeys: ["name", "slug"],
  });

  const name = validateTenantName(input?.name);
  const slug = validateTenantSlug(input?.slug);

  return { name, slug };
}
