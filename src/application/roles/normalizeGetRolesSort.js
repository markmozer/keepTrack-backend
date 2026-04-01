/**
 * File: src/application/roles/normalizeGetRolesSort.js
 */


import { normalizeSort } from "../shared/pagination/normalizeSort.js";

/**
 * @param {import("../ports/roles/role.types.js").GetRolesUCPayload["sort"] | undefined} sort
 * @returns {import("../shared/pagination/pagination.types.js").SortNormalized}
 */
export function normalizeGetRolesSort(sort) {
  return normalizeSort({
    sort,
    allowedFields: ["name", "createdAt", "updatedAt"],
    defaultField: "name",
    defaultDirection: "asc",
  });
}