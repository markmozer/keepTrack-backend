/**
 * File: src/application/users/InviteUser.js
 */

import { UserStatus } from "../../domain/users/UserStatus.js";
import { isInvitableStatus } from "../../domain/users/UserStatus.js";
import {
  ResourceNotFoundError,
  ValidationError,
} from "../../domain/shared/errors/index.js";
import { validateInviteUserInput } from "./inviteUser.validation.js";
import { toUserDtoPublic } from "./user.mappers.js";

/**
 * @typedef {import("../ports/users/user.types.js").InviteUserUseCaseInput} InviteUserUseCaseInput
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
   * @param {InviteUserUseCaseInput} input
   * @returns {Promise<UserDtoPublic>}
   */
  async execute(input) {
    const validated = validateInviteUserInput({
      tenantId: input?.tenantId,
      userId: input?.userId,
    });

    const baseUrl = this.config?.appBaseUrl;
    if (!baseUrl) throw new Error("InviteUser: config.appBaseUrl is required");
    
    const existingTenant = await this.tenantRepository.findById(
      validated.tenantId,
    );
    if (!existingTenant) {
      throw new ResourceNotFoundError("tenant", {
        tenantId: validated.tenantId,
      });
    }

    const existingUser = await this.userRepository.findById({
      tenantId: validated.tenantId,
      userId: validated.userId,
    });

    if (!existingUser) {
      throw new ResourceNotFoundError("user", { userId: validated.userId });
    }

    if (!isInvitableStatus(existingUser.status)) {
      throw new ValidationError("user status must be NEW or INVITED", {
        status: existingUser.status,
      });
    }

    const assignedRoles = await this.userRoleRepository.findByUser({
      tenantId: validated.tenantId,
      userId: validated.userId,
    });

    if (!assignedRoles || assignedRoles.length === 0)
      throw new ValidationError("user has no roles", {
        userId: validated.userId,
      });

    const now = this.clockService.now();
    const hasValidRoleNowOrFuture = assignedRoles.some(
      (r) => !r.validTo || new Date(r.validTo) >= now,
    );
    if (!hasValidRoleNowOrFuture) {
      throw new ValidationError(
        "user has no valid roles now or in the future",
        {
          userId: validated.userId,
        },
      );
    }

    const { tokenPlaintext, tokenHash } = this.tokenService.generate();
    const ttlDays = this.config?.inviteTtlDays ?? 14;
    const expiresAt = this.clockService.addDays(now, ttlDays);

    const updated = await this.userRepository.setInviteToken({
      userId: validated.userId,
      tenantId: validated.tenantId,
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
