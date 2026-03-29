/**
 * File: src/application/shared/pagination/createPagedResult.js
 */

/**
 * Creates a standardized paged result.
 *
 * @template T
 * @param {Object} input
 * @param {T[]} input.items
 * @param {number} input.page
 * @param {number} input.pageSize
 * @param {number} input.totalItems
 * @returns {import("./pagination.types.js").PagedResult<T>}
 */
export function createPagedResult({ items, page, pageSize, totalItems }) {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
  };
}