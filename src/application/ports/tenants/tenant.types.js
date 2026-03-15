/**
 * File: src/application/ports/tenants/tenant.types.js
 */

/**
 * @typedef {import("../../../domain/tenants/TenantStatus.js").TenantStatusValue} TenantStatus
 */

// =====================================================
// Repository models returned by persistance layer.
// =====================================================

/**
 * matches tenantSelect
 *
 * @typedef {Object} TenantRow
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {TenantStatus} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

// =====================================================
// DTOs returned by application layer.
// =====================================================
/**
 * mapped from TenantRow
 *
 * @typedef {Object} TenantDto
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {TenantStatus} status
 */

// =====================================================
// Use Case related
// =====================================================

// --- CreateTenant ---
/**
 * UCPayload
 * @typedef {Object} CreateTenantUCPayload
 * @property {unknown} name
 * @property {unknown} slug
 */

/**
 * UCInput
 * @typedef {Object} CreateTenantUCInput
 * @property {unknown} principal
 * @property {CreateTenantUCPayload} payload
 */

 /** 
 * RepoInput
 * @typedef {Object} CreateTenantRepoInput
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {TenantStatus} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

 // --- GetTenantById ---
/**
 * UCPayload
 * @typedef {Object} GetTenantByIdUCPayload
 * @property {unknown} targetTenantId
 */

/**
 * UCInput
 * @typedef {Object} GetTenantByIdUCInput
 * @property {unknown} principal
 * @property {GetTenantByIdUCPayload} payload
 */

 /** 
 * RepoInput
 * @typedef {Object} GetTenantByIdRepoInput
 * @property {string} targetTenantId
 */
export {};