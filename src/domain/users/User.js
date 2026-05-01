/**
 * File: keepTrack-backend/src/domain/users/User.js
 */

import {
  UserStatus,
  isStatusForInviteUser,
  isStatusForAcceptInvite,
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
 * @typedef {import("../shared/decision/decision.js").DomainDecision} DomainDecision
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
        userId: this.id,
      });
    }

    this.status = UserStatus.ACTIVE;
    this.passwordHash = passwordHash;
    this.inviteTokenHash = null;
    this.inviteTokenExpiresAt = null;
  }
}
