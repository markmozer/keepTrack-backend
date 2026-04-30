/**
 * File: keepTrack-backend/src/domain/users/UserRole.js
 */

export class UserRole {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {string} params.tenantId
   * @param {string} params.userId
   * @param {string} params.roleId
   * @param {Date} params.validFrom
   * @param {Date | null} params.validTo
   * @param {Date} params.createdAt
   * @param {Date} params.updatedAt
   * @param {string | undefined} [params.roleName]
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
   */
  expire(now) {
    if (!this.validTo || this.validTo > now) {
      this.validTo = now;
    }
  }
}
