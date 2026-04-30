/**
 * File: src/application/ports/users/user.types.js
 */

/**
 * @typedef {import("../../../domain/users/UserStatus.js").UserStatusValue} UserStatus
 * @typedef {import("../shared/action.types.js").AvailableActionsDto} AvailableActionsDto
 */

/**
 * @typedef {"inviteUser" | "deactivateUser" | "deleteUser" | "createRoleAssignment"} UserActionName
 */

/**
 * @typedef {"updateRoleAssignment" | "deleteRoleAssignment"} UserRoleActionName
 */

/**
 * @typedef {Partial<Record<UserActionName, import("../shared/action.types.js").ActionDecisionDto>>} UserAvailableActionsDto
 */

/**
 * @typedef {Partial<Record<UserRoleActionName, import("../shared/action.types.js").ActionDecisionDto>>} UserRoleAvailableActionsDto
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
// Infrastructure layer     select              userDetailRowSelect
// Infrastructure layer     return model        userDetailRow
// Application layer        return model        userDetailDto
// ============================================================

/**
 * @typedef {object} UserRoleDetailRow
 * @property {string} id
 * @property {string} roleId
 * @property {Date} validFrom
 * @property {Date|null} validTo
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {{ name: string }} role
 */

/**
 * @typedef {object} UserDetailRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {UserStatus} status
 * @property {Array<UserRoleDetailRow>} userRoles
 * @property {Date|null} inviteTokenExpiresAt
 * @property {Date|null} resetTokenExpiresAt
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {object} ForgotPasswordUserRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {UserStatus} status
 * @property {Array<UserRoleDetailRow>} userRoles
 * @property {string|null} resetTokenHash
 * @property {Date|null} resetTokenExpiresAt
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {object} UserRoleDetailDto
 * @property {string} id
 * @property {string} roleId
 * @property {string} validFrom
 * @property {string|null} validTo
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} roleName
 */

/**
 * @typedef {object} UserDetailDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {string} status
 * @property {Array<UserRoleDetailDto>} userRoles
 * @property {string|null} inviteTokenExpiresAt
 * @property {string|null} resetTokenExpiresAt
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Specific for AssignRoleToUser
 * to accomodate idempotent behaviour (created true || false)
 *
 * @typedef {Object} AssignRoleToUserDto
 * @property {boolean} created
 * @property {UserDetailDto} payload
 */

// ============================================================
// Infrastructure layer     select              publicUserRowSelect
// Infrastructure layer     return model        publicUserRow
// Application layer        return model        publicUserDto
// ============================================================

/**
 * @typedef {object} UserRoleRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {Date} validFrom
 * @property {Date|null} validTo
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {{ name: string }} role
 */

/**
 * @typedef {object} publicUserRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {UserStatus} status
 * @property {Array<UserRoleRow>} userRoles
 * @property {Date|null} inviteTokenExpiresAt
 * @property {Date|null} resetTokenExpiresAt
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {object} UserRoleDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {string} validFrom
 * @property {string|null} validTo
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} roleName
 * @property {UserRoleAvailableActionsDto} [availableActions]
 */

/**
 * @typedef {object} publicUserDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {string} status
 * @property {Array<UserRoleDto>} userRoles
 * @property {string|null} inviteTokenExpiresAt
 * @property {string|null} resetTokenExpiresAt
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {UserAvailableActionsDto} [availableActions]
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
 * @property {{ validFrom: Date, validTo: Date | null, role: { name: string } }[]} userRoles
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
 * @property {unknown} tenantId
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

// --- ForgotPassword ---
/**
 * UCPayload
 * @typedef {Object} ForgotPasswordUCPayload
 * @property {unknown} email
 * @property {unknown} tenantId
 */

/**
 * UCInput
 * @typedef {Object} ForgotPasswordUCInput
 * @property {null} principal
 * @property {ForgotPasswordUCPayload} payload
 */

/**
 * RepoInput
 * @typedef {Object} ForgotPasswordRepoInput
 * @property {string} tenantId 
 * @property {string} userId
 * @property {string|null} resetTokenHash
 * @property {Date|null} resetTokenExpiresAt
 * @property {Date} updatedAt
 */

// --- ResetPassword ---
/**
 * UCPayload
 * @typedef {Object} ResetPasswordUCPayload
 * @property {unknown} tenantId
 * @property {unknown} tokenPlain
 * @property {unknown} passwordPlain
 */

/**
 * UCInput
 * @typedef {Object} ResetPasswordUCInput
 * @property {null} principal
 * @property {ResetPasswordUCPayload} payload
 */

/**
 * RepoInput
 * @typedef {Object} ResetPasswordRepoInput
 * @property {string} userId
 * @property {string} passwordHash
 * @property {null} resetTokenHash
 * @property {null} resetTokenExpiresAt
 * @property {Date} updatedAt
 */


// --- GetUserById ---
/**
 * UCPayload
 * @typedef {Object} GetUserByIdUCPayload
 * @property {unknown} userId
 */

/**
 * UCInput
 * @typedef {Object} GetUserByIdUCInput
 * @property {unknown} principal
 * @property {GetUserByIdUCPayload} payload
 */

/**
 * Input used for findById
 * 
 * RepoInput 
 * @typedef {Object} FindUserByIdRepoInput
 * @property {string} tenantId
 * @property {string} userId
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
 * Input used for findByEmail
 * 
 * RepoInput
 * @typedef {Object} FindUserByEmailRepoInput
 * @property {string} tenantId
 * @property {string} email
 */

/**
 * Input used for forgot-password candidate lookup
 *
 * RepoInput
 * @typedef {Object} FindForgotPasswordUserByEmailRepoInput
 * @property {string} tenantId
 * @property {string} email
 */

/**
 * Input used for findByInviteTokenHash
 *
 * RepoInput
 * @typedef {Object} FindUserByInviteTokenHashRepoInput
 * @property {string} tenantId
 * @property {string} inviteTokenHash
 */

/**
 * Input used for findByResetTokenHash
 *
 * RepoInput
 * @typedef {Object} FindUserByResetTokenHashRepoInput
 * @property {string} tenantId
 * @property {string} resetTokenHash
 */

/**
 * Input used for findFindByRoleId
 * @typedef {Object} FindUsersByRoleIdRepoInput
 * @property {string} tenantId
 * @property {string} roleId
 */

export {};
