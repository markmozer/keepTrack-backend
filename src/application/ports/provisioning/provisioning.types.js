/**
 * File: src/application/ports/provisioning/provisioning.types.js
 */


/**
 * File: src/application/ports/tenants/tenant.types.js
 */

/**
 * @typedef {import("../../../application/ports/tenants/tenant.types.js").TenantDto} TenantDto
 * @typedef {import("../../../application/ports/roles/role.types.js").RoleDto} RoleDto
 * @typedef {import("../../../application/ports/users/user.types.js").UserAdminDto} UserAdminDto
 * @typedef {import("../../../application/ports/userRoles/userRole.types.js").UserRoleDto} UserRoleDto
 */

// =====================================================
// Repository models returned by persistance layer.
// =====================================================

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
 * @property {RoleDto} provisionedRole
 * @property {string} userAction
 * @property {UserAdminDto} provisionedUser
 * @property {string} userRoleAction
 * @property {UserRoleDto} provisionedUserRole
 * @property {string} inviteUserAction
 * @property {UserAdminDto} invitedUser
 * @property {string} tokenPlaintext
 * 

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


 // =====================================================
// repo only types
// =====================================================


export {};