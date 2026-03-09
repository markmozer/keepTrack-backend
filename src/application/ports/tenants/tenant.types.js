/**
 * File: keepTrack-backend/src/application/ports/tenants/tenant.types.js
 */


/**
 * @typedef {import("../../../domain/tenants/TenantStatus.js").TenantStatusValue} TenantStatus
 */

/**
 * Repository model returned by persistence layer.
 *
 * @typedef {Object} TenantRow
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {TenantStatus} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * DTO returned by application layer.
 *
 * @typedef {Object} TenantDto
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {TenantStatus} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Input used by repository when creating a tenant.
 *
 * @typedef {Object} CreateTenantRepoInput
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {TenantStatus} status
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

export {};