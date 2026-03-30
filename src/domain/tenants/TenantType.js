/**
 * File: src/domain/shared/tenants/TenantType.js
 */

/**
 * @typedef {"BASE" | "CLIENT" | "DEMO" } TenantTypeValue
 */

export const TenantType = Object.freeze({
  BASE: "BASE",
  CLIENT: "CLIENT",
  DEMO: "DEMO"
});

export const tenantTypeRules = Object.freeze({
  [TenantType.BASE]: { maxCount: 1 },
  [TenantType.DEMO]: { maxCount: 1 },
  [TenantType.CLIENT]: { maxCount: Infinity },
});

/**
 * 
 * @param {TenantTypeValue} type 
 * @returns {boolean}
 */
export function isSingletonTenantType(type) {
  return tenantTypeRules[type]?.maxCount === 1;
}