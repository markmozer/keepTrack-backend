/**
 * File: keepTrack-backend/src/domain/users/User.js
 */

import {
  UserStatus,
  isStatusForInviteUser,
  isStatusForAcceptInvite,
  isStatusForAuthenticateUser,
  isStatusForForgotPassword,
  isStatusForResetPassword,
} from "./UserStatus.js";

import { UserRole } from "./UserRole.js";
import { allow, deny } from "../shared/decision/decision.js";
import { ValidationError } from "../shared/errors/index.js";

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

/**
 * @typedef {object} AssignRoleParams
 * @property {string} roleId
 * @property {Date} validFrom
 * @property {Date | null} validTo
 * @property {Date} now
 */

/**
 * @typedef {object} InviteUserParams
 * @property {string} inviteTokenHash
 * @property {Date} inviteTokenExpiresAt
 * @property {Date} now
 */

/**
 * @typedef {object} ActivateFromInviteParams
 * @property {string} passwordHash
 * @property {Date} now
 */

/**
 * @typedef {object} RequestPasswordResetParams
 * @property {string} resetTokenHash
 * @property {Date} resetTokenExpiresAt
 * @property {Date} now
 */

/**
 * @typedef {object} ResetPasswordParams
 * @property {string} passwordHash
 * @property {Date} now
 */

/**
 * @typedef {import("../shared/decision/decision.js").DomainDecision} DomainDecision
 */

/**
 * @param {string | undefined | null} value
 * @returns {value is string}
 */
function isString(value) {
  return typeof value === "string";
}

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
    return this.userRoles.some((userRole) => userRole.isCurrentOrFuture(now));
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
    return this.userRoles.filter((userRole) => userRole.isCurrentOrFuture(now));
  }

  /**
   * Returns the earliest date on which this user can login based on role validity.
   *
   * If the user already has a valid role now, returns now.
   * If the user has no valid role now but has a future role, returns the earliest validFrom.
   * If the user has no current/future role, returns null.
   *
   * @param {Date} now
   * @returns {Date | null}
   */
  getEarliestLoginDate(now) {
    if (this.hasValidRoleNow(now)) {
      return now;
    }

    const futureRoleStartDates = this.userRoles
      .filter((userRole) => userRole.isFuture(now))
      .map((userRole) => userRole.validFrom)
      .sort((a, b) => a.getTime() - b.getTime());

    return futureRoleStartDates[0] ?? null;
  }

  /**
   * @param {Date} now
   * @returns {string[]}
   */
  getValidRoleNames(now) {
    return this.userRoles
      .filter((userRole) => userRole.isValidNow(now))
      .map((userRole) => userRole.roleName)
      .filter(isString);
  }

  /**
   * @param {{roleId: string}} params
   * @returns {DomainDecision}
   */
  canAssignRole({ roleId }) {
    const alreadyHasRole = this.userRoles.some(
      (userRole) => userRole.roleId === roleId,
    );

    if (alreadyHasRole) {
      return deny("USER_ALREADY_HAS_ROLE", {
        userId: this.id,
        roleId,
      });
    }

    return allow();
  }

  /**
   *
   * @param {AssignRoleParams} params
   * @returns
   */
  assignRole({ roleId, validFrom, validTo, now }) {
    if (!this.id) throw new ValidationError("User not yet persisted");

    const decision = this.canAssignRole({ roleId });

    if (!decision.allowed) {
      return null;
    }

    const userRole = UserRole.createNew({
      tenantId: this.tenantId,
      userId: this.id,
      roleId,
      validFrom,
      validTo,
      now,
    });

    this.userRoles.push(userRole);

    return userRole;
  }

  /**
   * @param {import("./UserRole.js").UserRole} tempUserRole
   * @param {import("./UserRole.js").UserRole} persistedUserRole
   */
  replaceUserRole(tempUserRole, persistedUserRole) {
    const index = this.userRoles.indexOf(tempUserRole);

    if (index === -1) {
      throw new Error("Temporary UserRole not found on User.");
    }

    this.userRoles[index] = persistedUserRole;
  }

  /**
   * @param {Date} now
   * @returns {DomainDecision}
   */
  canBeInvited(now) {
    if (!isStatusForInviteUser(this.status)) {
      return deny("USER_STATUS_NOT_INVITABLE", { status: this.status });
    }

    if (!this.hasCurrentOrFutureRole(now)) {
      return deny("USER_HAS_NO_CURRENT_OR_FUTURE_ROLE", { userId: this.id });
    }

    return allow();
  }

  /**
   * @param {InviteUserParams} params
   */
  invite({ inviteTokenHash, inviteTokenExpiresAt, now }) {
    const decision = this.canBeInvited(now);

    if (!decision.allowed) {
      throw new ValidationError("User cannot be invited.", {
        reason: decision.reason,
        ...decision.details,
      });
    }

    this.status = UserStatus.INVITED;
    this.inviteTokenHash = inviteTokenHash;
    this.inviteTokenExpiresAt = inviteTokenExpiresAt;

    this.resetTokenHash = null;
    this.resetTokenExpiresAt = null;
  }

  /**
   * @param {Date} now
   * @returns {DomainDecision}
   */
  canActivateFromInvite(now) {
    if (!isStatusForAcceptInvite(this.status)) {
      return deny("USER_STATUS_NOT_FOR_ACTIVATE_FROM_INVITE");
    }

    if (!this.inviteTokenHash) {
      return deny("INVITE_TOKEN_MISSING");
    }

    if (!this.inviteTokenExpiresAt) {
      return deny("INVITE_TOKEN_EXPIRY_MISSING");
    }

    if (this.inviteTokenExpiresAt <= now) {
      return deny("INVITE_TOKEN_EXPIRED", {
        expiresAt: this.inviteTokenExpiresAt,
      });
    }

    if (!this.hasCurrentOrFutureRole(now)) {
      return deny("USER_HAS_NO_CURRENT_OR_FUTURE_ROLE", { userId: this.id });
    }

    return allow();
  }

  /**
   * @param {ActivateFromInviteParams} params
   */
  activateFromInvite({ passwordHash, now }) {
    const decision = this.canActivateFromInvite(now);

    if (!decision.allowed) {
      throw new ValidationError("Invite cannot be accepted.", {
        reason: decision.reason,
        ...decision.details,
      });
    }

    this.status = UserStatus.ACTIVE;
    this.passwordHash = passwordHash;
    this.inviteTokenHash = null;
    this.inviteTokenExpiresAt = null;
  }

  /**
   * @returns {DomainDecision}
   */
  canAuthenticate() {
    if (!isStatusForAuthenticateUser(this.status)) {
      return deny("USER_STATUS_INVALID_FOR_LOGIN", { status: this.status });
    }

    if (!this.passwordHash) {
      return deny("USER_HAS_NO_PASSWORD");
    }

    return allow();
  }

  /**
   * @param {Date} now
   * @returns {DomainDecision}
   */
  canLogin(now) {
    if (!this.hasValidRoleNow(now)) {
      return deny("USER_HAS_NO_VALID_ROLE", {
        earliestLoginDate: this.getEarliestLoginDate(now),
      });
    }

    return allow();
  }

  /**
   * @param {Date} now
   * @returns {DomainDecision}
   */
  canRequestPasswordReset(now) {
    if (!isStatusForForgotPassword(this.status)) {
      return deny("USER_STATUS_NOT_VALID_FOR_FORGOT_PASSWORD", {
        status: this.status,
      });
    }

    if (!this.passwordHash) {
      return deny("USER_HAS_NO_PASSWORD");
    }

    if (!this.hasCurrentOrFutureRole(now)) {
      return deny("USER_HAS_NO_CURRENT_OR_FUTURE_ROLE", { userId: this.id });
    }

    return allow();
  }

  /**
   * @param {RequestPasswordResetParams} params
   */
  requestPasswordReset({ resetTokenHash, resetTokenExpiresAt, now }) {
    const decision = this.canRequestPasswordReset(now);

    if (!decision.allowed) {
      throw new ValidationError("Password reset cannot be requested.", {
        reason: decision.reason,
        ...decision.details,
      });
    }

    this.resetTokenHash = resetTokenHash;
    this.resetTokenExpiresAt = resetTokenExpiresAt;
  }

  clearPasswordReset() {
    this.resetTokenHash = null;
    this.resetTokenExpiresAt = null;
  }

  /**
   * @param {Date} now
   * @returns {DomainDecision}
   */
  canResetPassword(now) {
    if (
      !this.resetTokenExpiresAt ||
      this.resetTokenExpiresAt === null ||
      !(this.resetTokenExpiresAt instanceof Date)
    ) {
      return deny("Reset token expiry is invalid.");
    }

    if (this.resetTokenExpiresAt <= now) {
      return deny("Reset token has expired.", {
        expiredAt: this.resetTokenExpiresAt,
      });
    }

    if (!isStatusForResetPassword(this.status)) {
      return deny("USER_STATUS_NOT_VALID_FOR_RESET_PASSWORD", {
        status: this.status,
      });
    }

    if (!this.passwordHash) {
      return deny("USER_HAS_NO_PASSWORD");
    }

    if (!this.hasCurrentOrFutureRole(now)) {
      return deny("USER_HAS_NO_CURRENT_OR_FUTURE_ROLE", { userId: this.id });
    }

    return allow();
  }

  /**
   * @param {ResetPasswordParams} params
   */
  resetPassword({ passwordHash, now }) {
    const decision = this.canResetPassword(now);

    if (!decision.allowed) {
      throw new ValidationError("Password cannot be reset.", {
        reason: decision.reason,
        ...decision.details,
      });
    }

    ((this.passwordHash = passwordHash), (this.resetTokenHash = null));
    this.resetTokenExpiresAt = null;
  }
}
