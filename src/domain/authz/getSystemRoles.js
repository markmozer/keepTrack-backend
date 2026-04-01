/**
 * File: src/domain/authz/getSystemRoles.js
 */


import { systemRoleDefinitions } from "./systemRoleDefinitions.js";

/**
 * @param {"BASE" | "TENANT"} type
 */
export function getSystemRoles(type) {
  if (type === "BASE") {
    return systemRoleDefinitions;
  }

  if (type === "TENANT") {
    return systemRoleDefinitions.filter(
      (r) => r.scope === "TENANT"
    );
  }

  throw new Error(`Unknown role type: ${type}`);
}