/**
 * File: src/domain/tenants/createTenant.js
 */

import { ValidationError } from "../shared/errors/index.js";

/**
 * @param {unknown} value
 * @returns {string}
 */
export function validateTenantName(value) {
  if (typeof value !== "string") {
    throw new ValidationError("Tenant name must be a string.");
  }

  const name = value.trim();

  if (!name) {
    throw new ValidationError("Tenant name is required.");
  }

  if (name.length < 2) {
    throw new ValidationError("Tenant name must be at least 2 characters.");
  }

  if (name.length > 120) {
    throw new ValidationError("Tenant name must be at most 120 characters.");
  }

  return name;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function validateTenantSlug(value) {
  if (typeof value !== "string") {
    throw new ValidationError("Tenant slug must be a string.");
  }

  const slug = value.trim();

  if (!slug) {
    throw new ValidationError("Tenant slug is required.");
  }

  if (slug.length < 2) {
    throw new ValidationError("Tenant slug must be at least 2 characters.");
  }

  if (slug.length > 80) {
    throw new ValidationError("Tenant slug must be at most 80 characters.");
  }

  if (slug !== slug.toLowerCase()) {
    throw new ValidationError("Tenant slug must be lowercase.");
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new ValidationError(
      "Tenant slug may only contain lowercase letters, numbers, and hyphens."
    );
  }

  if (slug.startsWith("-") || slug.endsWith("-")) {
    throw new ValidationError(
      "Tenant slug may not start or end with a hyphen."
    );
  }

  if (slug.includes("--")) {
    throw new ValidationError(
      "Tenant slug may not contain consecutive hyphens."
    );
  }

  return slug;
}