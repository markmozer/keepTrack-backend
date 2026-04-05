/**
 * File: src/application/provisioning/ProvisionTenantInviteAdminUser.js
 */

// port assertions
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertTokenServicePort } from "../ports/security/TokenServicePort.js";
import { assertClockServicePort } from "../ports/clock/ClockServicePort.js";
import { assertEmailServicePort } from "../ports/email/EmailServicePort.js";
import { assertTenantLinkBuilderServicePort } from "../ports/urls/TenantLinkBuilderServicePort.js";

// validation
import { v } from "../../domain/shared/validation/validators.js";
import { validateProvisioningPrincipal } from "../auth/validateProvisioningPrincipal.js";
import { validateProvisionTenantInviteAdminUserPayload } from "./provisionTenantInviteAdminUser.validation.js";

// domain
import {
  UserStatus,
  isStatusForInviteUser,
} from "../../domain/users/UserStatus.js";

// mappers
import { toUserAdminDto } from "../users/user.mappers.js";

// other
import { ConflictError } from "../../domain/shared/errors/index.js";

/**
 * @typedef {Object} ProvisionedAdminUserDto
 * @property {boolean} success
 * @property {boolean} invited
 * @property {import("../ports/users/user.types.js").UserAdminDto | null} payload
 * @property {string | null} token
 * @property {any} error
 */

export class ProvisionTenantInviteAdminUser {
  /**
   * @param {Object} deps
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   * @param {import("../ports/security/TokenServicePort.js").TokenServicePort} deps.tokenService
   * @param {import("../ports/clock/ClockServicePort.js").ClockServicePort} deps.clockService
   * @param {import("../ports/urls/TenantLinkBuilderServicePort.js").TenantLinkBuilderServicePort} deps.tenantLinkBuilderService
   * @param {import("../ports/email/EmailServicePort.js").EmailServicePort} deps.emailService
   */
  constructor({
    tenantRepository,
    userRepository,
    tokenService,
    clockService,
    tenantLinkBuilderService,
    emailService,
  }) {
    assertTenantRepositoryPort(tenantRepository);
    assertUserRepositoryPort(userRepository);
    assertTokenServicePort(tokenService);
    assertClockServicePort(clockService);
    assertTenantLinkBuilderServicePort(tenantLinkBuilderService);
    assertEmailServicePort(emailService);
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    ((this.clockService = clockService),
      (this.tenantLinkBuilderService = tenantLinkBuilderService));
    this.emailService = emailService;
  }

  /**
   * @param {import("../ports/provisioning/provisioning.types.js").ProvisionTenantInviteAdminUserUCInput} input
   * @returns {Promise<ProvisionedAdminUserDto>}
   */
  async execute(input) {
    const obj = v.object(input, "ProvisionTenantInviteAdminUserUCInput");

    validateProvisioningPrincipal(obj.principal);
    const payload = validateProvisionTenantInviteAdminUserPayload(obj.payload);

    const tenant = await this.tenantRepository.findById(payload.tenantId);

    if (!tenant) {
      return {
        success: false,
        invited: false,
        payload: null,
        token: null,
        error: `tenant with id ${payload.tenantId} does not exist`,
      };
    }

    const existingUser = await this.userRepository.findById({
      tenantId: tenant.id,
      userId: payload.userId,
    });

    if (!existingUser) {
      return {
        success: false,
        invited: false,
        payload: null,
        token: null,
        error: `user with id ${payload.userId} does not exist`,
      };
    }

    if (!isStatusForInviteUser(existingUser.status)) {
      throw new ConflictError(
        `tenant admin user with id ${payload.userId} has univitable status ${existingUser.status}.`,
      );
    }

    const inviteUserAction =
      existingUser.status === UserStatus.NEW ? "create" : "update";

    const { tokenPlaintext, tokenHash } = this.tokenService.generate();
    const ttlDays = 14;
    const expiresAt = this.clockService.addDays(payload.now, ttlDays);

    const updated = await this.userRepository.markAsInvited({
      userId: existingUser.id,
      tenantId: existingUser.tenantId,
      status: UserStatus.INVITED,
      inviteTokenHash: tokenHash,
      inviteTokenExpiresAt: expiresAt,
      updatedAt: payload.now,
    });

    if (!(updated.inviteTokenExpiresAt instanceof Date)) {
      throw new Error("Invite token expiration not set correctly.");
    }

    const inviteLink = this.tenantLinkBuilderService.buildInviteLink({
      slug: tenant.slug,
      token: tokenPlaintext,
    });

    await this.emailService.sendInviteUserEmail({
      to: updated.email,
      link: inviteLink,
      expiresAt: updated.inviteTokenExpiresAt,
      validityPeriod: `${ttlDays} days`,
    });

    return {
      success: true,
      invited: true,
      payload: toUserAdminDto(updated),
      token: tokenPlaintext,
      error: null,
    };
  }
}
