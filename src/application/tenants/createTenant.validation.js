/**
 * File: src/application/tenants/createTenant.validation.js
 */

import { v } from "../../domain/shared/validation/validators.js";
import {
  validateTenantName,
  validateTenantSlug,
} from "../../domain/tenants/createTenant.js";
// import { TenantStatus } from "../../domain/tenants/TenantStatus.js";
// import { ValidationError } from "../../domain/shared/errors/index.js";
// import { toSafeJsonValue } from "../../domain/shared/errors/toSafeJsonValue.js";

/**
 * @typedef {Object} CreateTenantPayload
 * @property {unknown} name
 * @property {unknown} slug
 */

/**
 * @param {CreateTenantPayload} input
 */
export function validateCreateTenantInput(input) {
  v.object(input, "input", {
    allowedKeys: ["name", "slug"],
    requiredKeys: ["name", "slug"],
  });

  const name = validateTenantName(input?.name);
  const slug = validateTenantSlug(input?.slug);
  // const status = normalizeEnumOrDefault(
  //   input?.status,
  //   TenantStatus,
  //   "status",
  //   TenantStatus.ACTIVE,
  // );

  return { name, slug };
}

// /**
//  * @template {Record<string, string>} TEnum
//  * @param {unknown} raw
//  * @param {TEnum} enumObj
//  * @param {string} fieldName
//  * @param {TEnum[keyof TEnum]} def
//  * @returns {TEnum[keyof TEnum]}
//  */
// function normalizeEnumOrDefault(raw, enumObj, fieldName, def) {
//   if (raw == null) return def;

//   if (typeof raw !== "string") {
//     throw new ValidationError(`${fieldName} must be a string.`, {
//       received: toSafeJsonValue(raw),
//     });
//   }

//   const s = raw.trim();
//   if (s === "") return def;

//   const normalized = s.toUpperCase();

//   if (!Object.values(enumObj).includes(normalized)) {
//     throw new ValidationError(`${fieldName} is invalid.`, {
//       received: s,
//       allowed: Object.values(enumObj),
//     });
//   }

//   return /** @type {TEnum[keyof TEnum]} */ (normalized);
// }