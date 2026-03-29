/**
 * File: src/application/users/normalizeGetUsersFilters.js
 */
import { ValidationError } from "../../domain/shared/errors/index.js";

const ALLOWED_USER_STATUSES = ["NEW", "INVITED", "ACTIVE", "INACTIVE"];

/**
 * @param {import("../ports/users/user.types.js").GetUsersFilters | undefined} filters
 * @returns {import("../ports/users/user.types.js").GetUsersFiltersRepo}
 */
export function normalizeGetUsersFilters(filters) {
  if (!filters) {
    return {
      email: undefined,
      status: undefined,
      roleName: undefined,
    };
  }

  const email =
    typeof filters.email === "string" && filters.email.trim().length > 0
      ? filters.email.trim().toLowerCase()
      : undefined;

  const roleName =
    typeof filters.roleName === "string" && filters.roleName.trim().length > 0
      ? filters.roleName.trim()
      : undefined;

  let status = undefined;

  if (filters.status !== undefined) {
    if (
      typeof filters.status !== "string" ||
      !ALLOWED_USER_STATUSES.includes(filters.status)
    ) {
      throw new ValidationError(
        `payload.filters.status must be one of: ${ALLOWED_USER_STATUSES.join(", ")}`
      );
    }

    status = filters.status;
  }

  return {
    email,
    status,
    roleName,
  };
}