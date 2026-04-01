/**
 * File: src/application/roles/normalizeGetRolesFilters.js
 */

/**
 * @param {import("../ports/roles/role.types.js").GetRolesFilters | undefined} filters
 * @returns {import("../ports/roles/role.types.js").GetRolesFiltersRepo}
 */
export function normalizeGetRolesFilters(filters) {
  if (!filters) {
    return {
      roleName: undefined,
    };
  }

  const roleName =
    typeof filters.roleName === "string" && filters.roleName.trim().length > 0
      ? filters.roleName.trim()
      : undefined;

  return {
    roleName,
  };
}