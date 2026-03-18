/**
 * File: src/application/ports/roles/role.types.js
 */

// =====================================================
// Repository models returned by persistance layer.
// =====================================================
/**
 * matches roleSelect
 *
 * @typedef {Object} RoleRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

// =====================================================
// DTOs returned by application layer.
// =====================================================
/**
 * mapped from RoleRow
 *
 * @typedef {Object} RoleDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 */

/**
 * For auth
 *
 * @typedef {Object} RoleNameDto
 * @property {string} name
 */

// =====================================================
// Use Case related
// =====================================================

// --- CreateRole ---
/**
 * UCPayload
 * @typedef {Object} CreateRoleUCPayload
 * @property {unknown} name
 */

/**
 * UCInput
 * @typedef {Object} CreateRoleUCInput
 * @property {unknown} principal
 * @property {CreateRoleUCPayload} payload
 */

/**
 * RepoInput
 * @typedef {Object} CreateRoleRepoInput
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Input for findById
 * 
 * UCInput = RepoInput
 * @typedef {Object} FindRoleByIdInput
 * @property {string} tenantId
 * @property {string} roleId
 */

/**
 * Input for findByName
 * 
 * UCInput = RepoInput
 * @typedef {Object} FindRoleByNameInput
 * @property {string} tenantId
 * @property {string} name
 */

export {};
