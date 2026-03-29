/**
 * File: src/application/shared/pagination/normalizePagination.js
 */

import { ValidationError } from "../../../domain/shared/errors/index.js";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

/**
 * Normalizes incoming pagination input into repository-friendly values.
 *
 * @param {import("./pagination.types.js").PaginationInput | undefined} input
 * @returns {import("./pagination.types.js").PaginationNormalized}
 */
export function normalizePagination(input) {
  const rawPage = input?.page ?? DEFAULT_PAGE;
  const rawPageSize = input?.pageSize ?? DEFAULT_PAGE_SIZE;

  if (!Number.isInteger(rawPage) || rawPage < 1) {
    throw new ValidationError("payload.pagination.page must be an integer >= 1");
  }

  if (
    !Number.isInteger(rawPageSize) ||
    rawPageSize < 1 ||
    rawPageSize > MAX_PAGE_SIZE
  ) {
    throw new ValidationError(
      `payload.pagination.pageSize must be an integer between 1 and ${MAX_PAGE_SIZE}`
    );
  }

  return {
    page: rawPage,
    pageSize: rawPageSize,
    skip: (rawPage - 1) * rawPageSize,
    take: rawPageSize,
  };
}