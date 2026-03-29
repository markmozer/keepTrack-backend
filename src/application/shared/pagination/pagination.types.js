/**
 * File: src/application/shared/pagination/pagination.types.js
 */


/**
 * Shared pagination / sorting typedefs for list-style use-cases.
 */

/**
 * @typedef {Object} PaginationInput
 * @property {number} [page=1]
 * @property {number} [pageSize=25]
 */

/**
 * @typedef {Object} PaginationNormalized
 * @property {number} page
 * @property {number} pageSize
 * @property {number} skip
 * @property {number} take
 */

/**
 * @typedef {Object} SortInput
 * @property {string} [field]
 * @property {"asc"|"desc"} [direction]
 */

/**
 * @typedef {Object} SortNormalized
 * @property {string} field
 * @property {"asc"|"desc"} direction
 */

/**
 * @typedef {Object} PagedResultMeta
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalItems
 * @property {number} totalPages
 */

/**
 * @template T
 * @typedef {Object} PagedResult
 * @property {T[]} items
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalItems
 * @property {number} totalPages
 */

export{}