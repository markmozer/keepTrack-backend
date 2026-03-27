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
 * @property {Date | null} resetTokenExpiresAt
 * @property {UserStatus} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Minimal role row embedded in UserRowPublicWithRoles
 *
 * @typedef {Object} RoleRowPublic
 * @property {string} id
 * @property {string} name
 */

/**
 * Minimal userRole row embedded in UserRowPublicWithRoles
 *
 * @typedef {Object} UserRoleRowPublicWithRole
 * @property {string} id
 * @property {RoleRowPublic} role
 */

/**
 * matches userSelectPublicWithRoles
 *
 * @typedef {Object} UserRowPublicWithRoles
 * @property {string} tenantId
 * @property {string} id
 * @property {string} email
 * @property {Date | null} inviteTokenExpiresAt
 * @property {Date | null} resetTokenExpiresAt
 * @property {UserStatus} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {UserRoleRowPublicWithRole[]} userRoles
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
 * @property {string | null} resetTokenExpiresAt
 * @property {UserStatus} status
 */

/**
 * Public role DTO
 *
 * @typedef {Object} RoleDtoPublic
 * @property {string} id
 * @property {string} name
 */

/**
 * DTO returned by application layer
 * (user + roles flattened)
 *
 * @typedef {Object} UserDtoPublicWithRoles
 * @property {string} tenantId
 * @property {string} id
 * @property {string} email
 * @property {string | null} inviteTokenExpiresAt
 * @property {string | null} resetTokenExpiresAt
 * @property {UserStatus} status
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {RoleDtoPublic[]} roles
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

// --- RequestPasswordReset ---
/**
 * UCPayload
 * @typedef {Object} RequestPasswordResetUCPayload
 * @property {unknown} email
 * @property {unknown} tenantId
 */

/**
 * UCInput
 * @typedef {Object} RequestPasswordResetUCInput
 * @property {null} principal
 * @property {RequestPasswordResetUCPayload} payload
 */

/**
 * RepoInput
 * @typedef {Object} MarkAsPwdResetRequestedRepoInput
 * @property {string} tenantId 
 * @property {string} userId
 * @property {string} resetTokenHash
 * @property {Date} resetTokenExpiresAt
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

/**
 * Input used for findFindByRoleId
 * @typedef {Object} FindUsersByRoleIdRepoInput
 * @property {string} tenantId
 * @property {string} roleId
 */

export {};
