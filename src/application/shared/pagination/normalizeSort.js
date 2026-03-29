/**
 * File: src/application/shared/pagination/normalizeSort.js
 */

import { ValidationError } from "../../../domain/shared/errors/index.js";

/**
 * @param {Object} input
 * @param {import("./pagination.types.js").SortInput | undefined} input.sort
 * @param {string[]} input.allowedFields
 * @param {string} input.defaultField
 * @param {"asc"|"desc"} [input.defaultDirection="asc"]
 * @returns {import("./pagination.types.js").SortNormalized}
 */
export function normalizeSort({
  sort,
  allowedFields,
  defaultField,
  defaultDirection = "asc",
}) {
  const field = sort?.field ?? defaultField;
  const direction = sort?.direction ?? defaultDirection;

  if (!allowedFields.includes(field)) {
    throw new ValidationError(
      `payload.sort.field must be one of: ${allowedFields.join(", ")}`
    );
  }

  if (direction !== "asc" && direction !== "desc") {
    throw new ValidationError(
      'payload.sort.direction must be either "asc" or "desc"'
    );
  }

  return {
    field,
    direction,
  };
}