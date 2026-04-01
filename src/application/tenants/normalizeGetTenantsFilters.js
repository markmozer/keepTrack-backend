/**
 * File: src/application/tenants/normalizeGetTenantsFilters.js
 */
import { ValidationError } from "../../domain/shared/errors/index.js";

const ALLOWED_TENANT_STATUSES = ["NEW", "INVITED", "ACTIVE", "INACTIVE"];
const ALLOWED_TENANT_TYPES = ["BASE", "DEMO", "CLIENT"];

/**
 * @param {import("../ports/tenants/tenant.types.js").GetTenantsFilters | undefined} filters
 * @returns {import("../ports/tenants/tenant.types.js").GetTenantsFiltersRepo}
 */
export function normalizeGetTenantsFilters(filters) {
  if (!filters) {
    return {
      name: undefined,
      slug: undefined,
      type: undefined,
      status: undefined,
    };
  }

  const name =
    typeof filters.name === "string" && filters.name.trim().length > 0
      ? filters.name.trim().toLowerCase()
      : undefined;

  const slug =
    typeof filters.slug === "string" && filters.slug.trim().length > 0
      ? filters.slug.trim().toLowerCase()
      : undefined;

    let type = undefined;

  if (filters.type !== undefined) {
    if (
      typeof filters.type !== "string" ||
      !ALLOWED_TENANT_TYPES.includes(filters.type)
    ) {
      throw new ValidationError(
        `payload.filters.type must be one of: ${ALLOWED_TENANT_TYPES.join(", ")}`,
      );
    }

    type = filters.type;
  }    

  let status = undefined;

  if (filters.status !== undefined) {
    if (
      typeof filters.status !== "string" ||
      !ALLOWED_TENANT_STATUSES.includes(filters.status)
    ) {
      throw new ValidationError(
        `payload.filters.status must be one of: ${ALLOWED_TENANT_STATUSES.join(", ")}`,
      );
    }

    status = filters.status;
  }

  return {
    name,
    slug,
    type,
    status,
  };
}
