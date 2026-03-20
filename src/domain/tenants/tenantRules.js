/**
 * File: src/domain/tenants/tenantRules.js
 */

import { TenantType } from "./TenantType.js";
import { TenantStatus } from "./TenantStatus.js";

export const tenantRules = [
  {
    tenantNameRules: [
      "Tenant name is required.",
      "Tenant name must be a string.",
      "Tenant name cannot contain leading/trailing spaces.",
      "Tenant name must be between 2 and 120 characters",
    ],
  },
  {
    tenantSlugRules: [
      "Tenant slug is required.",
      "Tenant slug must be a string.",
      "Tenant slug cannot contain leading/trailing spaces.",
      "Tenant slug must be between 2 and 80 characters",
      "Tenant slug may only contain lowercase letters, numbers, and hyphens.",
      "Tenant slug may not start or end with a hyphen.",
      "Tenant slug may not contain consecutive hyphens.",
    ],
  },
];

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidTenantName(value) {
  if (typeof value !== "string") return false; // Tenant name must be a string.

  const name = value.trim();

  if (!name) return false; // Tenant name is required.
  if (name !== value) return false; // Tenant name cannot contain leading/trailing spaces.
  if (name.length < 2 || name.length > 120) return false; // Tenant name must be between 2 and 120 characters
  return true;
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidTenantSlug(value) {
  if (typeof value !== "string") return false; // Tenant slug must be a string.

  const slug = value.trim();

  if (!slug) return false; // Tenant slug is required.
  if (slug !== value) return false; // Tenant slug cannot contain leading/trailing spaces.
  if (slug.length < 2 || slug.length > 80) return false; // Tenant slug must be between 2 and 80 characters
  if (!/^[a-z0-9-]+$/.test(slug)) return false; // Tenant slug may only contain lowercase letters, numbers, and hyphens.
  if (slug.startsWith("-") || slug.endsWith("-")) return false; // Tenant slug may not start or end with a hyphen.
  if (slug.includes("--")) return false; // Tenant slug may not contain consecutive hyphens.
  return true;
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidTenantType(value) {
  return isValidEnumValue(value, TenantType);
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidTenantStatus(value) {
  return isValidEnumValue(value, TenantStatus);
}

/**
 * @param {unknown} type
 * @returns {boolean}
 */
export function isBaseTenant(type) {
  return type === TenantType.BASE;
}

/**
 * @param {unknown} type
 * @returns {boolean}
 */
export function isClientTenant(type) {
  return type === TenantType.CLIENT;
}

/**
 * @param {unknown} type
 * @returns {boolean}
 */
export function isDemoTenant(type) {
  return type === TenantType.DEMO;
}

/**
 * @param {unknown} status
 * @returns {boolean}
 */
export function isActiveTenant(status) {
  return status === TenantStatus.ACTIVE;
}

/**
 * @template {Record<string, string>} TEnum
 * @param {unknown} raw
 * @param {TEnum} enumObj
 * @returns {boolean}
 */
function isValidEnumValue(raw, enumObj) {
  if (raw == null) return false;
  if (typeof raw !== "string") return false;
  const s = raw.trim();
  if (s === "") return false;

  const normalized = s.toUpperCase();
  if (!Object.values(enumObj).includes(normalized)) {
    return false;
  }
  return true;
}
