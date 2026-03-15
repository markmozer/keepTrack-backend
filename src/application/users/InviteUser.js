/**
 * File: src/application/users/InviteUser.js
 */

import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertUserRoleRepositoryPort } from "../ports/userRoles/UserRoleRepositoryPort.js";
import { assertTokenServicePort } from "../ports/security/TokenServicePort.js";
import { assertEmailServicePort } from "../ports/email/EmailServicePort.js";
import { assertClockServicePort } from "../ports/clock/ClockServicePort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { UserStatus } from "../../domain/users/UserStatus.js";
import { isStatusForInviteUser } from "../../domain/users/UserStatus.js";
import {
  ResourceNotFoundError,
  ValidationError,
} from "../../domain/shared/errors/index.js";
import { validateInviteUserPayload } from "./inviteUser.validation.js";
import { toUserDtoPublic } from "./user.mappers.js";

/**
 * @typedef {import("../ports/users/user.types.js").InviteUserUCInput} InviteUserUCInput
 * @typedef {import("../ports/users/user.types.js").UserDtoPublic} UserDtoPublic
 *
 * @typedef {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 * @typedef {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} UserRepositoryPort
 * @typedef {import("../ports/userRoles/UserRoleRepositoryPort.js").UserRoleRepositoryPort} UserRoleRepositoryPort
 * @typedef {import("../ports/security/TokenServicePort.js").TokenServicePort} TokenServicePort
 * @typedef {import("../ports/clock/ClockServicePort.js").ClockServicePort} ClockServicePort
 * @typedef {import("../ports/email/EmailServicePort.js").EmailServicePort} EmailServicePort
 */

/**
 * @typedef {Object} Config
 * @property {number} inviteTtlDays
 * @property {string} appBaseUrl
 */

export class InviteUser {
  /**
   * @param {{
   * tenantRepository: TenantRepositoryPort,
   * userRepository: UserRepositoryPort,
   * userRoleRepository: UserRoleRepositoryPort,
   * tokenService: TokenServicePort,
   * emailService: EmailServicePort,
   * clockService: ClockServicePort,
   * config: Config }} deps
   */
  constructor({
    tenantRepository,
    userRepository,
    userRoleRepository,
    tokenService,
    emailService,
    clockService,
    config,
  }) {
    assertTenantRepositoryPort(tenantRepository);
    assertUserRepositoryPort(userRepository);
    assertUserRoleRepositoryPort(userRoleRepository);
    assertTokenServicePort(tokenService);
    assertEmailServicePort(emailService);
    assertClockServicePort(clockService);
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
    this.tokenService = tokenService;
    this.emailService = emailService;
    this.clockService = clockService;
    this.config = config;
  }

  /**
   *
   * @param {InviteUserUCInput} input
   * @returns {Promise<UserDtoPublic>}
   */
  async execute(input) {

    const obj = v.object(input, "InviteUser input");

    const principal = validatePrincipal(obj.principal);
    const payload = validateInviteUserPayload(obj.payload);

    const tenantId = principal.tenantId;    
    const baseUrl = this.config?.appBaseUrl;
    if (!baseUrl) throw new Error("InviteUser: config.appBaseUrl is required");
    
    const existingTenant = await this.tenantRepository.findById(
      tenantId,
    );
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

    const assignedRoles = await this.userRoleRepository.findByUser({
      tenantId: tenantId,
      userId: payload.targetUserId,
    });

    if (!assignedRoles || assignedRoles.length === 0)
      throw new ValidationError("user has no roles", {
        userId: payload.targetUserId,
      });

    const now = this.clockService.now();
    const hasValidRoleNowOrFuture = assignedRoles.some(
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

    const link = `${baseUrl}/set-password?token=${encodeURIComponent(tokenPlaintext)}`;

    await this.emailService.sendInviteUserEmail({
      to: updated.email,
      link,
      expiresAt: returnedExpiresAt,
    });

    return toUserDtoPublic(updated);
  }
}
