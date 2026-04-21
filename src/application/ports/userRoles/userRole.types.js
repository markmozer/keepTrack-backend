/**
 * File: src/application/ports/userRoles/userRole.types.js
 */

// ============================================================
// Infrastructure layer     select              userRoleRowSelect
// Infrastructure layer     return model        userRoleRow
// Application layer        return model        userRoleDto
// ============================================================

/**
 * @typedef {Object} UserRoleRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {Date} validFrom
 * @property {Date | null} validTo
 * @property {{name: string}} role
 */

/**
 * @typedef {Object} UserRoleDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {string} validFrom
 * @property {string | null} validTo
 * @property {string} roleName
 */



// ============================================================
// Infrastructure layer     select              userRoleAdminRowSelect
// Infrastructure layer     return model        userRoleAdminRow
// Application layer        return model        userRoleAdminDto
// ============================================================
/**
 * @typedef {Object} UserRoleAdminRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {Date} validFrom
 * @property {Date | null} validTo
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {{name: string}} role
 */

/**
 * @typedef {Object} UserRoleAdminDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {string} validFrom
 * @property {string | null} validTo
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} roleName
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
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {Date} validFrom
 * @property {Date | null} validTo
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */


// =====================================================
// repo only types
// =====================================================

/**
 * Input used for findUserRoleByUserAndRole
 * 
 * RepoInput 
 * @typedef {Object}  FindUserRoleByUserAndRoleRepoInput
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 */


/**
 * Input used for findUserRolesByUser
 * 
 * RepoInput 
 * @typedef {Object}  FindUserRolesByUserRepoInput
 * @property {string} tenantId
 * @property {string} userId
 */


/**
 * Input used for findValidUserRolesByUser
 * 
 * RepoInput 
 * @typedef {Object}  FindValidUserRolesByUserRepoInput
 * @property {string} tenantId
 * @property {string} userId
 * @property {Date} atDate
 */


export {};
