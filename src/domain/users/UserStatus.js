/**
 * File: src/domain/users/UserStatus.js
 */



/**
 * @typedef {"NEW" | "INVITED" | "ACTIVE" | "INACTIVE"} UserStatusValue
 */

export const UserStatus = Object.freeze({
  NEW: "NEW",
  INVITED: "INVITED",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
});

/**
 * Business rule:
 * A user can only be invited if status is NEW or INVITED.
 *
 * @param {UserStatusValue} status
 * @returns {boolean}
 */
export function isStatusForInviteUser(status) {
  return (
    status === UserStatus.NEW ||
    status === UserStatus.INVITED
  );
}

/**
 * Business rule:
 * A user can only be invited if status is NEW or INVITED.
 *
 * @param {UserStatusValue} status
 * @returns {boolean}
 */
export function isStatusForAcceptInvite(status) {
  return (
    status === UserStatus.INVITED
  );
}

/**
 * Business rule:
 * A user can only login if status is ACTIVE.
 *
 * @param {UserStatusValue} status
 * @returns {boolean}
 */
export function isStatusForAuthenticateUser(status) {
  return (
    status === UserStatus.ACTIVE
  );
}

/**
 * Business rule:
 * A user can only request a password reset if status is ACTIVE.
 *
 * @param {UserStatusValue} status
 * @returns {boolean}
 */
export function isStatusForRequestPasswordReset(status) {
  return (
    status === UserStatus.ACTIVE
  );
}