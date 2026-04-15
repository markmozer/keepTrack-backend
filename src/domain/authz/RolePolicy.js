/**
 * File: src/domain/authz/RolePolicy.js
 */

/**
 * @typedef {import("../auth/Principal").Principal} Principal
 * @typedef {import("./authz.types.js").CrudAction} CrudAction
 * @typedef {import("./authz.types.js").Resource} Resource
 * @typedef {import("./authz.types.js").AuthzContext} AuthzContext
 */

/**
 * @typedef {Object} Deps
 * @property {import("./permissionsByRole.js").PermissionsByRole} permissionsByRole
 */
export class RolePolicy {
  /**
   * @param {Deps} params
   */
  constructor({ permissionsByRole }) {
    if (!permissionsByRole) {
      throw new Error("RolePolicy: permissionsByRole is required");
    }
    this.permissionsByRole = permissionsByRole;
  }

  /**
   * @param {{
   *  principal: Principal,
   *  action: CrudAction,
   *  resource: Resource,
   *  context?: AuthzContext,
   * }} params
   * @returns {boolean}
   */
  isAllowed({ principal, action, resource, context = {} }) {
    // (Optioneel) tenant check als je principal.tenantId gebruikt
    if (
      context.tenantId &&
      principal.tenantId &&
      context.tenantId !== principal.tenantId
    ) {
      return false;
    }

    const roleNames = principal.roleNames ?? [];

    // 1) pure RBAC
    for (const roleName of roleNames) {
      const perms = this.permissionsByRole[roleName] ?? [];
      if (perms.some((p) => p.action === action && p.resource === resource)) {
        return true;
      }
    }

    // 2) optionele instance-level exceptions
    // (USER mag zichzelf updaten)
    if (resource === "user" && (action === "read" || action === "update")) {
      // context.ownerId = de userId van de user die je probeert te lezen/updaten
      if (context.ownerId && context.ownerId === principal.userId) return true;
    }
    // (USER mag zijn eigen tenant lezen)
    if (resource === "tenant" && action === "read") {
      // context.ownerId = de tenantId van de tenant die je probeert te lezen
      if (context.ownerId && context.ownerId === principal.tenantId)
        return true;
    }
    // (PRINCIPAL mag zijn eigen session lezen)
    if (resource === "session" && action === "read") {
      // context.ownerId = de userId van de user die je probeert te lezen
      // context.tenantId = de tenantId van de user die je probeert te lezen
      if (
        context.ownerId &&
        context.ownerId === principal.userId &&
        context.tenantId &&
        context.tenantId=== principal.tenantId
      )
        return true;
    }

    return false;
  }
}
