/**
 * File: keepTrack-backend/src/application/ports/auth/auth.types.js
 */
/**
 * @typedef {import("../../../domain/users/UserStatus.js").UserStatusValue} UserStatus
 */

// =====================================================
// Repository models returned by persistance layer.
// =====================================================
/**
 * matches userSelectForAuth
 *
 * @typedef {Object} UserRowForAuth
 * @property {string} tenantId
 * @property {string} id
 * @property {string} email
 * @property {string | null} passwordHash
 * @property {UserStatus} status
 * @property {{ validFrom: Date, validTo: Date | null, role: { name: string } }[]} userRoles
 */

// =====================================================
// DTOs returned by application layer.
// =====================================================


/**
 * @typedef {Object} AuthenticatedUserDto
 * @property {string} userId
 * @property {string} tenantId
 * @property {UserStatus} status
 * @property {string[]} roleNames
 */

/**
 * @typedef {Object} AuthenticationResultDto
 * @property {string} sessionId
 * @property {AuthenticatedUserDto} user
 */

// =====================================================
// Use Case related
// =====================================================

// --- AuthenticateUser ---
/**
 * UCPayload
 * @typedef {Object} AuthenticateUserUCPayload
 * @property {unknown} tenantId
 * @property {unknown} email
 * @property {unknown} passwordPlain
 */

/**
 * UCInput
 * @typedef {Object} AuthenticateUserUCInput
 * @property {null} principal
 * @property {AuthenticateUserUCPayload} payload
 */

/**
 * RepoInput
 * @typedef {Object} FindUserByEmailForAuthRepoInput
 * @property {string} tenantId
 * @property {string} email
 */

export {};




