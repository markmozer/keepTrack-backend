/**
 * File: keepTrack-backend/src/application/ports/roles/role.types.js
 */

/**
 * @typedef {Object} RoleDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CreateRoleRepoInput
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

/**
 * @typedef {Object} AssignRoleToUserRepoInput
 * @property {string} id
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {Date} validFrom
 * @property {Date | null} validTo
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

export {};
