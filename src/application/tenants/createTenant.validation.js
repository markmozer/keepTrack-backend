/**
 * File: src/application/tenants/createTenant.validation.js
 */

import { v } from "../../domain/shared/validation/validators.js";
import {
  validateTenantName,
  validateTenantSlug,
} from "../../domain/tenants/createTenant.js";

import { TenantType } from "../../domain/tenants/TenantType.js";


/**
 * @param {import("../ports/tenants/tenant.types.js").CreateTenantUCPayload} input
 */
export function validateCreateTenantPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["name", "slug", "type"],
    requiredKeys: ["name", "slug", "type"],
  });

  const name = validateTenantName(input?.name);
  const slug = validateTenantSlug(input?.slug);
  const type = v.EnumStringOrDefault(input?.type, TenantType, "tenantType", undefined )

  return { name, slug, type };
}
