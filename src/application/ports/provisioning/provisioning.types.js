/**
 * File: src/application/ports/provisioning/provisioning.types.js
 */

/**
 * @typedef {import("../../../application/ports/tenants/tenant.types.js").TenantDto} TenantDto
 * @typedef {import("../../../application/ports/roles/role.types.js").RoleAdminDto} RoleAdminDto
 * @typedef {import("../../../application/ports/users/user.types.js").UserAdminDto} UserAdminDto
 * @typedef {import("../../../application/ports/userRoles/userRole.types.js").UserRoleDto} UserRoleDto
 */


// =====================================================
// DTOs returned by application layer.
// =====================================================
/**
 * mapped from ?
 *
 * @typedef {Object} ProvisionBaseTenantDto
 * @property {string} tenantAction
 * @property {TenantDto} provisionedTenant
 * @property {string} roleAction
 * @property {RoleAdminDto[]} provisionedRoles
 * @property {string} userAction
 * @property {UserAdminDto} provisionedUser
 * @property {string} userRoleAction
 * @property {UserRoleDto} provisionedUserRole
 * @property {string} inviteUserAction
 * @property {UserAdminDto} invitedUser
 * @property {string} tokenPlaintext
 */


// =====================================================
// Use Case related
// =====================================================

// --- ProvisionBaseTenant ---
/**
 * UCPayload
 * @typedef {Object} ProvisionBaseTenantUCPayload
 * @property {unknown} name
 * @property {unknown} slug
 * @property {unknown} adminEmail
 */

/**
 * UCInput
 * @typedef {Object} ProvisionBaseTenantUCInput
 * @property {unknown} principal
 * @property {ProvisionBaseTenantUCPayload} payload
 */

// --- ProvisionTenant ---
/**
 * UCPayload
 * @typedef {Object} ProvisionTenantUCPayload
 * @property {unknown} name
 * @property {unknown} slug
 * @property {unknown} type
 * @property {unknown} [now]
 */

/**
 * UCInput
 * @typedef {Object} ProvisionTenantUCInput
 * @property {unknown} principal
 * @property {ProvisionTenantUCPayload} payload
 */

// --- ProvisionTenantRoles ---
/**
 * UCPayload
 * @typedef {Object} ProvisionRolesUCPayload
 * @property {unknown} tenantId
 * @property {unknown} [now]
 */

/**
 * UCInput
 * @typedef {Object} ProvisionRolesUCInput
 * @property {unknown} principal
 * @property {ProvisionRolesUCPayload} payload
 */

// --- ProvisionTenantAdminUser ---
/**
 * UCPayload
 * @typedef {Object} ProvisionTenantAdminUserUCPayload
 * @property {unknown} tenantId
 * @property {unknown} email
 * @property {unknown} [now]
 */

/**
 * UCInput
 * @typedef {Object} ProvisionTenantAdminUserUCInput
 * @property {unknown} principal
 * @property {ProvisionTenantAdminUserUCPayload} payload
 */

// --- ProvisionTenantAdminUserRole ---
/**
 * UCPayload
 * @typedef {Object} ProvisionTenantAdminUserRoleUCPayload
 * @property {unknown} tenantId
 * @property {unknown} userId
 * @property {unknown} roleName
 * @property {unknown} [now]
 */

/**
 * UCInput
 * @typedef {Object} ProvisionTenantAdminUserRoleUCInput
 * @property {unknown} principal
 * @property {ProvisionTenantAdminUserRoleUCPayload} payload
 */

// --- ProvisionTenantInviteAdminUser ---
/**
 * UCPayload
 * @typedef {Object} ProvisionTenantInviteAdminUserUCPayload
 * @property {unknown} tenantId
 * @property {unknown} userId
 * @property {unknown} [now]
 */

/**
 * UCInput
 * @typedef {Object} ProvisionTenantInviteAdminUserUCInput
 * @property {unknown} principal
 * @property {ProvisionTenantInviteAdminUserUCPayload} payload
 */


 // =====================================================
// repo only types
// =====================================================


export {};