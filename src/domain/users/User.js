/**
 * File: keepTrack-backend/src/domain/users/User.js
 */

import { UserStatus } from "./UserStatus.js";

/**
 * @typedef {object} UserParams
 * @property {string | null} id
 * @property {string} tenantId
 * @property {string} email
 * @property {string | null} [passwordHash]
 * @property {string | null} [inviteTokenHash]
 * @property {Date | null} [inviteTokenExpiresAt]
 * @property {string | null} [resetTokenHash]
 * @property {Date | null} [resetTokenExpiresAt]
 * @property {import("./UserStatus.js").UserStatusValue} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {import("./UserRole.js").UserRole[]} [userRoles]
 */

/**
 * @typedef {object} CreateNewUserParams
 * @property {string} tenantId
 * @property {string} email
 * @property {Date} now
 */

export class User {
  /**
   * @param {UserParams} params
   */
  constructor({
    id,
    tenantId,
    email,
    passwordHash = null,
    inviteTokenHash = null,
    inviteTokenExpiresAt = null,
    resetTokenHash = null,
    resetTokenExpiresAt = null,
    status,
    createdAt,
    updatedAt,
    userRoles = [],
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.email = email;
    this.passwordHash = passwordHash;
    this.inviteTokenHash = inviteTokenHash;
    this.inviteTokenExpiresAt = inviteTokenExpiresAt;
    this.resetTokenHash = resetTokenHash;
    this.resetTokenExpiresAt = resetTokenExpiresAt;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.userRoles = userRoles;
  }

  /**
   * @param {CreateNewUserParams} params
   * @returns {User}
   */
  static createNew({ tenantId, email, now }) {
    return new User({
      id: null,
      tenantId,
      email,
      status: UserStatus.NEW,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * @param {Date} now
   * @returns {boolean}
   */
  hasValidRoleNow(now) {
    return this.userRoles.some((userRole) => userRole.isValidNow(now));
  }

  /**
   * @param {Date} now
   * @returns {boolean}
   */
  hasCurrentOrFutureRole(now) {
    return this.userRoles.some((userRole) =>
      userRole.isCurrentOrFuture(now)
    );
  }

  /**
   * @param {Date} now
   * @returns {import("./UserRole.js").UserRole[]}
   */
  getValidRoles(now) {
    return this.userRoles.filter((userRole) => userRole.isValidNow(now));
  }

  /**
   * @param {Date} now
   * @returns {import("./UserRole.js").UserRole[]}
   */
  getCurrentOrFutureRoles(now) {
    return this.userRoles.filter((userRole) =>
      userRole.isCurrentOrFuture(now)
    );
  }
}