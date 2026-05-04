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
// Infrastructure layer     select          userAggregateRowSelect
// Infrastructure layer     return model    userAggregateRow
// ============================================================

/**
 * @typedef {object} UserAggregateRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} email
 * @property {UserStatus} status
 * @property {string} passwordHash
 * @property {string | null} inviteTokenHash
 * @property {Date | null} inviteTokenExpiresAt
 * @property {string | null} resetTokenHash
 * @property {Date | null} resetTokenExpiresAt
 * @property {Array<UserAggregateRolesRow>} userRoles
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {object} UserAggregateRolesRow
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
 * @typedef {Object} UserListItemDto
 * @property {string} tenantId
 * @property {string} id
 * @property {string} email
 * @property {UserStatus} status
 * @property {string[]} roleNames
 * @property {string} createdAt
 * @property {string} updatedAt
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
 * @typedef {object} PublicUserDto
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

/**
 * Specific for AssignRoleToUser
 * to accomodate idempotent behaviour (created true || false)
 *
 * @typedef {Object} AssignRoleToUserDto
 * @property {boolean} created
 * @property {PublicUserDto} payload
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

// --- AssignRoleToUser ---
/**
 * UCPayload
 * @typedef {Object} AssignRoleToUserUCPayload
 * @property {unknown} userId
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
 * @property {import("../../../domain/users/User.js").User[]} items
 * @property {number} totalItems
 */

/**
 * @typedef {import("../../shared/pagination/pagination.types.js").PagedResult<UserListItemDto>} GetUsersUCOutput
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

export {};
