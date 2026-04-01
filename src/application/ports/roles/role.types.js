/**
 * File: src/application/ports/roles/role.types.js
 */

// ============================================================
// Infrastructure layer     select              roleRowSelect
// Infrastructure layer     return model        roleRow
// Application layer        return model        roleDto
// ============================================================
/**
 * @typedef {Object} RoleRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 */

/**
 * @typedef {Object} RoleDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 */

// ============================================================
// Infrastructure layer     select              roleAdminRowSelect
// Infrastructure layer     return model        roleAdminRow
// Application layer        return model        roleAdminDto
// ============================================================
/**
 * @typedef {Object} RoleAdminRow
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} RoleAdminDto
 * @property {string} id
 * @property {string} tenantId
 * @property {string} name
 * @property {string} createdAt
 * @property {string} updatedAt
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

// --- GetRoles ---

/**
 * @typedef {Object} GetRolesFilters
 * @property {string} [roleName]
 */

/**
 * @typedef {Object} GetRolesUCPayload
 * @property {import("../../shared/pagination/pagination.types.js").PaginationInput} [pagination]
 * @property {GetRolesFilters} [filters]
 * @property {import("../../shared/pagination/pagination.types.js").SortInput} [sort]
 */

/**
 * @typedef {Object} GetRolesUCInput
 * @property {unknown} principal
 * @property {GetRolesUCPayload} payload
 */

/**
 * Repository filter input after normalization.
 *
 * @typedef {Object} GetRolesFiltersRepo
 * @property {string | undefined} roleName
 */

/**
 * @typedef {Object} FindRolesPageRepoInput
 * @property {string} tenantId
 * @property {number} skip
 * @property {number} take
 * @property {GetRolesFiltersRepo} filters
 * @property {import("../../shared/pagination/pagination.types.js").SortNormalized} sort
 */

/**
 * @typedef {Object} FindRolesPageRepoResult
 * @property {RoleRow[]} items
 * @property {number} totalItems
 */

/**
 * @typedef {import("../../shared/pagination/pagination.types.js").PagedResult<RoleDto>} GetRolesUCOutput
 */


// =====================================================
// repo only types
// =====================================================
/**
 * Input for findById
 * 
 * RepoInput
 * @typedef {Object} FindRoleByIdRepoInput
 * @property {string} tenantId
 * @property {string} roleId
 */

/**
 * Input for findByName
 * 
 * @typedef {Object} FindRoleByNameRepoInput
 * @property {string} tenantId
 * @property {string} name
 */

/**
 * Input for ensureRole
 * 
 * @typedef {Object} EnsureRoleRepoInput
 * @property {string} tenantId
 * @property {string} name
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

export {};
