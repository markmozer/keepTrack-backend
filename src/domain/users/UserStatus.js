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
export function isInvitableStatus(status) {
  return (
    status === UserStatus.NEW ||
    status === UserStatus.INVITED
  );
}
