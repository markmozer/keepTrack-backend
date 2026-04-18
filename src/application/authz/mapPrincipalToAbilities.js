// src/application/authz/mapPrincipalToAbilities.js

import { permissionsByRole } from "../../domain/authz/permissionsByRole.js";

/**
 * @param {{ roleNames: string[] }} principal
 * @returns {string[]}
 */
export function mapPrincipalToAbilities(principal) {
  const roleNames = Array.isArray(principal?.roleNames)
    ? principal.roleNames
    : [];

  const abilitySet = new Set();

  for (const roleName of roleNames) {
    const permissions = permissionsByRole[roleName] ?? [];

    for (const permission of permissions) {
      abilitySet.add(`${permission.resource}:${permission.action}`);
    }
  }

  return Array.from(abilitySet).sort();
}