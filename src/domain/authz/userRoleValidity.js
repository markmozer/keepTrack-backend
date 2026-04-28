/**
 * File: src/domain/authz/userRoleValidity.js
 */

/**
 * Minimal shape needed to reason about role validity.
 *
 * @typedef {Object} RoleValidityRow
 * @property {Date | string | null | undefined} validFrom
 * @property {Date | string | null | undefined} validTo
 */

/**
 * @param {Date | string | null | undefined} value
 * @returns {Date | null}
 */
function toDateOrNull(value) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * @param {Date | null} value
 * @returns {value is Date}
 */
function isDate(value) {
  return value instanceof Date;
}

/**
 * @param {RoleValidityRow | null | undefined} role
 * @param {Date} atDate
 * @returns {boolean}
 */
export function isRoleEffectiveAt(role, atDate) {
  const validFrom = toDateOrNull(role?.validFrom);
  const validTo = toDateOrNull(role?.validTo);

  if (!validFrom) {
    return false;
  }

  return validFrom <= atDate && (!validTo || validTo >= atDate);
}

/**
 * @param {RoleValidityRow | null | undefined} role
 * @param {Date} atDate
 * @returns {boolean}
 */
export function isRoleEffectiveNowOrFuture(role, atDate) {
  const validTo = toDateOrNull(role?.validTo);
  return !validTo || validTo >= atDate;
}

/**
 * @param {RoleValidityRow[] | null | undefined} roles
 * @param {Date} atDate
 * @returns {boolean}
 */
export function hasRoleEffectiveAt(roles, atDate) {
  return Array.isArray(roles) && roles.some((role) => isRoleEffectiveAt(role, atDate));
}

/**
 * @param {RoleValidityRow[] | null | undefined} roles
 * @param {Date} atDate
 * @returns {boolean}
 */
export function hasRoleEffectiveNowOrFuture(roles, atDate) {
  return (
    Array.isArray(roles) &&
    roles.some((role) => isRoleEffectiveNowOrFuture(role, atDate))
  );
}

/**
 * @param {RoleValidityRow[] | null | undefined} roles
 * @param {Date} atDate
 * @returns {Date | null}
 */
export function getNextRoleEffectiveAt(roles, atDate) {
  if (!Array.isArray(roles) || roles.length === 0) {
    return null;
  }

  /** @type {Date | null} */
  let nextDate = null;

  for (const role of roles) {
    const validFrom = toDateOrNull(role?.validFrom);

    if (!isDate(validFrom) || validFrom <= atDate) {
      continue;
    }

    if (!nextDate || validFrom < nextDate) {
      nextDate = validFrom;
    }
  }

  return nextDate;
}
