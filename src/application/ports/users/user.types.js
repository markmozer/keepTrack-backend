/**
 * File: src/application/ports/users/user.types.js
 */

/**
 * @typedef {import("../../../domain/users/UserStatus.js").UserStatusValue} UserStatus
 */

// =====================================================
// Repository models returned by persistance layer.
// =====================================================
/**
 * matches userSelectPublic
 *
 * @typedef {Object} UserRowPublic
 * @property {string} tenantId
 * @property {string} id
 * @property {string} email
 * @property {Date | null} inviteTokenExpiresAt
 * @property {UserStatus} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

// =====================================================
// DTOs returned by application layer.
// =====================================================
/**
 * mapped from UserRowPublic
 *
 * @typedef {Object} UserDtoPublic
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {string | null} inviteTokenExpiresAt
 * @property {UserStatus} status
 */


// =====================================================
// Use Case related
// =====================================================

// --- CreateUser ---
/**
 * UCPayload
 * @typedef {Object} CreateUserUCPayload
 * @property {unknown} email
 */

/**
 * UCInput
 * @typedef {Object} CreateUserUCInput
 * @property {unknown} principal
 * @property {CreateUserUCPayload} payload
 */

/**
 * RepoInput
 * @typedef {Object} CreateUserRepoInput
 * @property {string} tenantId
 * @property {string} id
 * @property {string} email
 * @property {UserStatus} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

// --- InviteUser ---
/**
 * UCPayload
 * @typedef {Object} InviteUserUCPayload
 * @property {unknown} targetUserId
 */

/**
 * UCInput
 * @typedef {Object} InviteUserUCInput
 * @property {unknown} principal
 * @property {InviteUserUCPayload} payload
 */

/**
 * RepoInput
 * @typedef {Object} MarkAsInvitedRepoInput
 * @property {string} tenantId 
 * @property {string} userId
 * @property {string} inviteTokenHash
 * @property {Date} inviteTokenExpiresAt
 * @property {UserStatus} status
 * @property {Date} updatedAt
 */

// --- AcceptInvite ---
/**
 * UCPayload
 * @typedef {Object} AcceptInviteUCPayload
 * @property {unknown} tokenPlain
 * @property {unknown} passwordPlain
 */

/**
 * UCInput
 * @typedef {Object} AcceptInviteUCInput
 * @property {null} principal
 * @property {AcceptInviteUCPayload} payload
 */

/**
 * RepoInput
 * @typedef {Object} ActivateFromInviteRepoInput
 * @property {string} userId
 * @property {string} passwordHash
 * @property {null} inviteTokenHash
 * @property {null} inviteTokenExpiresAt
 * @property {UserStatus} status
 * @property {Date} updatedAt
 */


// =====================================================
// repo only types
// =====================================================

/**
 * Input used for findById
 * 
 * RepoInput 
 * @typedef {Object} FindUserByIdRepoInput
 * @property {string} tenantId
 * @property {string} userId
 */

/**
 * Input used for findByEmail
 * 
 * RepoInput
 * @typedef {Object} FindUserByEmailRepoInput
 * @property {string} tenantId
 * @property {string} email
 */



export {};
