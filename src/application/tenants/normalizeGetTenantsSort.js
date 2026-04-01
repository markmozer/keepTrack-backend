/**
 * File: src/application/tenants/normalizeGetTenantsSort.js
 */


import { normalizeSort } from "../shared/pagination/normalizeSort.js";

/**
 * @param {import("../ports/tenants/tenant.types.js").GetTenantsUCPayload["sort"] | undefined} sort
 * @returns {import("../shared/pagination/pagination.types.js").SortNormalized}
 */
export function normalizeGetTenantsSort(sort) {
  return normalizeSort({
    sort,
    allowedFields: ["name", "slug", "type", "status", "createdAt", "updatedAt"],
    defaultField: "name",
    defaultDirection: "asc",
  });
}