/**
 * File: src/application/provisioning/provisionBaseTenant.validation.js
 */

import { v } from "../../domain/shared/validation/validators.js";
import { ValidationError } from "../../domain/shared/errors/index.js";
import {
  isValidTenantName,
  isValidTenantSlug,
} from "../../domain/tenants/tenantRules.js";
import { TenantType } from "../../domain/tenants/TenantType.js";
import { toSafeJsonValue } from "../../domain/shared/errors/toSafeJsonValue.js";

/**
 * @param {import("../ports/provisioning/provisioning.types.js").ProvisionTenantUCPayload} input
 */
export function validateProvisionTenantPayload(input) {
  v.object(input, "input", {
    allowedKeys: ["name", "slug", "type", "now"],
    requiredKeys: ["name", "slug", "type"],
  });

  if (!isValidTenantName(input.name))
    throw new ValidationError("tenant name is not valid", { tenantName: toSafeJsonValue(input.name) });
  const name = v.string(input.name, "tenant.name");

  if (!isValidTenantSlug(input.slug))
    throw new ValidationError("tenant slug is not valid", { tenantSlug: toSafeJsonValue(input.slug) });
  const slug = v.string(input.slug, "tenant.slug");

  const type = v.EnumStringOrDefault(
    input.type,
    TenantType,
    "TenantType",
    undefined,
  );

  let now = v.date(input.now, "timestamp", {
    nullable: true,
  });
  now = now ? now : new Date();

  return { name, slug, type, now };
}
