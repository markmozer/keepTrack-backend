/**
 * File: src/application/ports/userRoles/userRole.types.js
 */

// =====================================================
// Repository models returned by persistance layer.
// =====================================================
/**
 * matches userRoleRowPublicSelect
 *
 * @typedef {Object} UserRoleRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {Date} validFrom
 * @property {Date | null} validTo
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {string} roleName
 */

// =====================================================
// DTOs returned by application layer.
// =====================================================
/**
 * mapped from UserRoleRow
 *
 * @typedef {Object} UserRoleDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {string} validFrom
 * @property {string | null} validTo
 * @property {string} roleName
 */

/**
 * Specific for AssignRoleToUser
 * to accomodate idempotent behaviour (created true || false)
 *
 * @typedef {Object} AssignRoleToUserDto
 * @property {boolean} created
 * @property {UserRoleDto} payload
 */

// =====================================================
// Use Case related
// =====================================================

// --- AssignRoleToUser ---
/**
 * UCPayload
 * @typedef {Object} AssignRoleToUserUCPayload
 * @property {unknown} targetUserId
 * @property {unknown} roleId
 * @property {unknown} validFrom
 * @property {unknown} validTo
 */ 
 
/**
 * UCInput
 * @typedef {Object} AssignRoleToUserUCInput
 * @property {unknown} principal
 * @property {AssignRoleToUserUCPayload} payload
 */

/** 
 * RepoInput
 * @typedef {Object} AssignRoleToUserRepoInput
 * @property {string} id
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {Date} validFrom
 * @property {Date | null} validTo
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */



/**
 * Input used for findUserRoleByUserAndRole
 * 
 * UCInput === RepoInput 
 * @typedef {Object}  FindUserRoleByUserAndRoleInput
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 */


/**
 * Input used for findUserRolesByUser
 * 
 * UCInput === RepoInput 
 * @typedef {Object}  FindUserRolesByUserInput
 * @property {string} tenantId
 * @property {string} userId
 */


/**
 * Input used for findValidUserRolesByUser
 * 
 * UCInput === RepoInput 
 * @typedef {Object}  FindValidUserRolesByUserInput
 * @property {string} tenantId
 * @property {string} userId
 * @property {Date} atDate
 */


export {};
