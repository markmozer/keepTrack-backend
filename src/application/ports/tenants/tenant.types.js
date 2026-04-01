/**
 * File: src/application/ports/tenants/tenant.types.js
 */

/**
 * @typedef {import("../../../domain/tenants/TenantStatus.js").TenantStatusValue} TenantStatus
 * @typedef {import("../../../domain/tenants/TenantType.js").TenantTypeValue} TenantType
 */

// ============================================================
// Infrastructure layer     select              tenantRowSelect
// Infrastructure layer     return model        tenantRow
// Application layer        return model        tenantDto
// ============================================================

/**
 * @typedef {Object} TenantRow
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {TenantType} type
 * @property {TenantStatus} status
 */

/**
 * @typedef {Object} TenantDto
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {TenantType} type
 * @property {TenantStatus} status
 */

// ============================================================
// Infrastructure layer     select              tenantAdminRowSelect
// Infrastructure layer     return model        tenantAdminRow
// Application layer        return model        tenantAdminDto
// ============================================================

/**
 * @typedef {Object} TenantAdminRow
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {TenantType} type
 * @property {TenantStatus} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} TenantAdminDto
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {TenantType} type
 * @property {TenantStatus} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

// =====================================================
// Use Case related
// =====================================================

// --- CreateTenant ---
/**
 * UCPayload
 * @typedef {Object} CreateTenantUCPayload
 * @property {unknown} name
 * @property {unknown} slug
 * @property {unknown} type
 */

/**
 * UCInput
 * @typedef {Object} CreateTenantUCInput
 * @property {unknown} principal
 * @property {CreateTenantUCPayload} payload
 */

/**
 * RepoInput
 * @typedef {Object} CreateTenantRepoInput
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {TenantType} type
 * @property {TenantStatus} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

// --- GetTenantById ---
/**
 * UCPayload
 * @typedef {Object} GetTenantByIdUCPayload
 * @property {unknown} targetTenantId
 */

/**
 * UCInput
 * @typedef {Object} GetTenantByIdUCInput
 * @property {unknown} principal
 * @property {GetTenantByIdUCPayload} payload
 */

// --- GetTenants ---

/**
 * @typedef {Object} GetTenantsFilters
 * @property {string} [name]
 * @property {string} [slug]
 * @property {TenantType} [type]
 * @property {TenantStatus} [status]
 */

/**
 * @typedef {Object} GetTenantsUCPayload
 * @property {import("../../shared/pagination/pagination.types.js").PaginationInput} [pagination]
 * @property {GetTenantsFilters} [filters]
 * @property {import("../../shared/pagination/pagination.types.js").SortInput} [sort]
 */

/**
 * @typedef {Object} GetTenantsUCInput
 * @property {unknown} principal
 * @property {GetTenantsUCPayload} payload
 */

/**
 * Repository filter input after normalization.
 *
 * @typedef {Object} GetTenantsFiltersRepo
 * @property {string | undefined} name
 * @property {string | undefined} slug
 * @property {TenantType | undefined} type
 * @property {TenantStatus | undefined} status
 */

/**
 * @typedef {Object} FindTenantsPageRepoInput
 * @property {number} skip
 * @property {number} take
 * @property {GetTenantsFiltersRepo} filters
 * @property {import("../../shared/pagination/pagination.types.js").SortNormalized} sort
 */

/**
 * @typedef {Object} FindTenantsPageRepoResult
 * @property {TenantRow[]} items
 * @property {number} totalItems
 */

/**
 * @typedef {import("../../shared/pagination/pagination.types.js").PagedResult<TenantDto>} GetTenantsUCOutput
 */

// =====================================================
// repo only types
// =====================================================

export {};
