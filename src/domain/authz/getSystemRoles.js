/**
 * File: src/domain/authz/getSystemRoles.js
 */

import { systemRoleDefinitions } from "./systemRoleDefinitions.js";

/**
 * @param {"BASE" | "CLIENT" | "DEMO" } type
 */
export function getSystemRoles(type) {
  if (type === "BASE") {
    return systemRoleDefinitions;
  } else if (type === "CLIENT" || type === "DEMO") {
    return systemRoleDefinitions.filter((r) => r.scope === "TENANT");
  }

  throw new Error(`Unknown role type: ${type}`);
}

/**
 * @param {"BASE" | "CLIENT" | "DEMO" } type
 */
export function getTenantAdminRole(type) {


  if (type === "BASE") {
    return "SUPER_ADMIN";
  } else if (type === "CLIENT" || type === "DEMO") {
    return "ADMIN"
  } else {
    throw new Error(`Unknown role type: ${type}`);
  }
}
