/**
 * File: src/application/users/normalizeGetUsersSort.js
 */


import { normalizeSort } from "../shared/pagination/normalizeSort.js";

/**
 * @param {import("../ports/users/user.types.js").GetUsersUCPayload["sort"] | undefined} sort
 * @returns {import("../shared/pagination/pagination.types.js").SortNormalized}
 */
export function normalizeGetUsersSort(sort) {
  return normalizeSort({
    sort,
    allowedFields: ["email", "status", "createdAt", "updatedAt"],
    defaultField: "email",
    defaultDirection: "asc",
  });
}