/**
 * File: keepTrack-backend/src/domain/users/UserRole.js
 */

/**
 * @typedef {object} UserRoleParams
 * @property {string | null} id
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {Date} validFrom
 * @property {Date | null} validTo
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {string | undefined} [roleName]
 */

/**
 * @typedef {object} CreateNewUserRoleParams
 * @property {string} tenantId
 * @property {string} userId
 * @property {string} roleId
 * @property {Date} validFrom
 * @property {Date | null} validTo
 * @property {Date} now
 */

export class UserRole {
  /**
   * @param {UserRoleParams} params
   */
  constructor({
    id,
    tenantId,
    userId,
    roleId,
    validFrom,
    validTo,
    createdAt,
    updatedAt,
    roleName,
  }) {
    this.id = id;
    this.tenantId = tenantId;
    this.userId = userId;
    this.roleId = roleId;
    this.validFrom = validFrom;
    this.validTo = validTo;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.roleName = roleName;
  }

  /**
   * @param {CreateNewUserRoleParams} params
   * @returns {UserRole}
   */
  static createNew({ tenantId, userId, roleId, validFrom, validTo, now }) {
    return new UserRole({
      id: null,
      tenantId,
      userId,
      roleId,
      validFrom,
      validTo,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * @param {Date} now
   * @returns {boolean}
   */
  isValidNow(now) {
    return this.validFrom <= now && (!this.validTo || this.validTo > now);
  }

  /**
   * @param {Date} now
   * @returns {boolean}
   */
  isCurrentOrFuture(now) {
    return !this.validTo || this.validTo > now;
  }

  /**
   * @param {Date} now
   * @returns {boolean}
   */
  isFuture(now) {
    return this.validFrom > now && (!this.validTo || this.validTo > now);
  }

  /**
   * @param {Date} now
   */
  expire(now) {
    if (!this.validTo || this.validTo > now) {
      this.validTo = now;
    }
  }
}
