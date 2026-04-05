/**
 * File: src/application/ports/users/user.types.js
 */

/**
 * @typedef {import("../../../domain/users/UserStatus.js").UserStatusValue} UserStatus
 */


// ============================================================
// Infrastructure layer     select              userRowSelect
// Infrastructure layer     return model        userRow
// Application layer        return model        userDto
// ============================================================

/**
 * @typedef {Object} UserRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {UserStatus} status
 * @property {{ role: { name: string } }[]} userRoles
 */

/**
 * @typedef {Object} UserDto
 * @property {string} tenantId
 * @property {string} id
 * @property {string} email
 * @property {UserStatus} status
 * @property {string[]} roleNames
 */

// ============================================================
// Infrastructure layer     select              userAdminRowSelect
// Infrastructure layer     return model        userAdminRow
// Application layer        return model        userAdminDto
// ============================================================

/**
 * @typedef {Object} UserAdminRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {UserStatus} status
 * @property {{ role: { name: string } }[]} userRoles
 * @property {Date | null} inviteTokenExpiresAt
 * @property {Date | null} resetTokenExpiresAt
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} UserAdminDto
 * @property {string} tenantId
 * @property {string} id
 * @property {string} email
 * @property {UserStatus} status
 * @property {string[]} roleNames
 * @property {string | null} inviteTokenExpiresAt
 * @property {string | null} resetTokenExpiresAt
 * @property {string} createdAt
 * @property {string} updatedAt
 */

// ============================================================
// Infrastructure layer     select              userAuthRowSelect
// Infrastructure layer     return model        userAuthRow
// Application layer        return model        n/a
// ============================================================

/**
 * @typedef {Object} UserAuthRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {UserStatus} status
 * @property {string} passwordHash
 * @property {{ role: { name: string } }[]} userRoles
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
 * @property {string} email
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

// --- GetUsers ---

/**
 * @typedef {Object} GetUsersFilters
 * @property {string} [email]
 * @property {UserStatus} [status]
 * @property {string} [roleName]
 */

/**
 * @typedef {Object} GetUsersUCPayload
 * @property {import("../../shared/pagination/pagination.types.js").PaginationInput} [pagination]
 * @property {GetUsersFilters} [filters]
 * @property {import("../../shared/pagination/pagination.types.js").SortInput} [sort]
 */

/**
 * @typedef {Object} GetUsersUCInput
 * @property {unknown} principal
 * @property {GetUsersUCPayload} payload
 */

/**
 * Repository filter input after normalization.
 *
 * @typedef {Object} GetUsersFiltersRepo
 * @property {string | undefined} email
 * @property {UserStatus | undefined} status
 * @property {string | undefined} roleName
 */

/**
 * @typedef {Object} FindUsersPageRepoInput
 * @property {string} tenantId
 * @property {number} skip
 * @property {number} take
 * @property {GetUsersFiltersRepo} filters
 * @property {import("../../shared/pagination/pagination.types.js").SortNormalized} sort
 */

/**
 * @typedef {Object} FindUsersPageRepoResult
 * @property {UserRow[]} items
 * @property {number} totalItems
 */

/**
 * @typedef {import("../../shared/pagination/pagination.types.js").PagedResult<UserDto>} GetUsersUCOutput
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
 * Input for ensureUser
 * 
 * @typedef {Object} EnsureUserRepoInput
 * @property {string} tenantId
 * @property {string} email
 * @property {string} name
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

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
