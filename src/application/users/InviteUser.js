/**
 * File: src/application/users/InviteUser.js
 */

import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertUserRoleRepositoryPort } from "../ports/userRoles/UserRoleRepositoryPort.js";
import { assertTokenServicePort } from "../ports/security/TokenServicePort.js";
import { assertEmailServicePort } from "../ports/email/EmailServicePort.js";
import { assertClockServicePort } from "../ports/clock/ClockServicePort.js";
import { assertTenantLinkBuilderServicePort } from "../ports/urls/TenantLinkBuilderServicePort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { validateInviteUserPayload } from "./inviteUser.validation.js";

import {
  ResourceNotFoundError,
  ValidationError,
} from "../../domain/shared/errors/index.js";

import { UserStatus } from "../../domain/users/UserStatus.js";
import { isStatusForInviteUser } from "../../domain/users/UserStatus.js";
import { CrudAction } from "../../domain/authz/authz.types.js";
import { Resource } from "../../domain/authz/authz.types.js";

import { toUserDetailDto } from "./user.mappers.js";


/**
 * @typedef {Object} Config
 * @property {number} inviteTtlDays
 */

export class InviteUser {
  /**
   * @param {Object} deps
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   * @param {import("../ports/userRoles/UserRoleRepositoryPort.js").UserRoleRepositoryPort} deps.userRoleRepository
   * @param {import("../ports/security/TokenServicePort.js").TokenServicePort} deps.tokenService
   * @param {import("../ports/clock/ClockServicePort.js").ClockServicePort} deps.clockService
   * @param {import("../ports/email/EmailServicePort.js").EmailServicePort} deps.emailService
   * @param {import("../ports/urls/TenantLinkBuilderServicePort.js").TenantLinkBuilderServicePort} deps.tenantLinkBuilderService
   * @param {import("../authz/AuthorizeAction.js").AuthorizeAction} deps.authorizeAction
   * @param {Config} deps.config
   *
   */
  constructor({
    tenantRepository,
    userRepository,
    userRoleRepository,
    tokenService,
    emailService,
    clockService,
    tenantLinkBuilderService,
    authorizeAction,
    config,
  }) {
    assertTenantRepositoryPort(tenantRepository);
    assertUserRepositoryPort(userRepository);
    assertUserRoleRepositoryPort(userRoleRepository);
    assertTokenServicePort(tokenService);
    assertEmailServicePort(emailService);
    assertClockServicePort(clockService);
    assertTenantLinkBuilderServicePort(tenantLinkBuilderService);
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
    this.tokenService = tokenService;
    this.emailService = emailService;
    this.clockService = clockService;
    this.tenantLinkBuilderService = tenantLinkBuilderService;
    this.authorizeAction = authorizeAction;
    this.config = config;
  }

  /**
   *
   * @param {import("../ports/users/user.types.js").InviteUserUCInput} input
   * @returns {Promise<import("../ports/users/user.types.js").UserDetailDto>}
   */
  async execute(input) {
    const obj = v.object(input, "InviteUser input");

    const principal = validatePrincipal(obj.principal);

    this.authorizeAction.execute({
      principal,
      action: CrudAction.update,
      resource: Resource.user,
      context: { useCase: "InviteUser" },
    });

    const payload = validateInviteUserPayload(obj.payload);

    const tenantId = principal.tenantId;

    const existingTenant = await this.tenantRepository.findById(tenantId);
    if (!existingTenant) {
      throw new ResourceNotFoundError("tenant", {
        tenantId,
      });
    }

    const existingUser = await this.userRepository.findById({
      tenantId,
      userId: payload.targetUserId,
    });

    if (!existingUser) {
      throw new ResourceNotFoundError("user", { userId: payload.targetUserId });
    }

    if (!isStatusForInviteUser(existingUser.status)) {
      throw new ValidationError("user status must be NEW or INVITED", {
        status: existingUser.status,
      });
    }

    if (!existingUser.userRoles || existingUser.userRoles.length === 0)
      throw new ValidationError("user has no roles", {
        userId: payload.targetUserId,
      });

    const now = this.clockService.now();
    const hasValidRoleNowOrFuture = existingUser.userRoles.some(
      (r) => !r.validTo || new Date(r.validTo) >= now,
    );
    if (!hasValidRoleNowOrFuture) {
      throw new ValidationError(
        "user has no valid roles now or in the future",
        {
          userId: payload.targetUserId,
        },
      );
    }

    const { tokenPlaintext, tokenHash } = this.tokenService.generate();
    const ttlDays = this.config?.inviteTtlDays ?? 14;
    const expiresAt = this.clockService.addDays(now, ttlDays);
    const validityPeriod = `${ttlDays} days`;

    const updated = await this.userRepository.markAsInvited({
      userId: payload.targetUserId,
      tenantId,
      status: UserStatus.INVITED,
      inviteTokenHash: tokenHash,
      inviteTokenExpiresAt: expiresAt,
      updatedAt: now,
    });

    // make sure that expiredAt is a valid date
    const returnedExpiresAt = updated.inviteTokenExpiresAt;
    if (!(returnedExpiresAt instanceof Date)) {
      throw new Error(
        "Invite token expiration must be set before sending email",
      );
    }

    const inviteLink = this.tenantLinkBuilderService.buildInviteLink({
      slug: existingTenant.slug,
      token: tokenPlaintext,
    });

    await this.emailService.sendInviteUserEmail({
      to: updated.email,
      link: inviteLink,
      expiresAt: returnedExpiresAt,
      validityPeriod,
    });

    return toUserDetailDto(updated);
  }
}
