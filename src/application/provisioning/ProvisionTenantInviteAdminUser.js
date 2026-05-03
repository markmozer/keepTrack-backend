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
} from "../../domain/users/UserStatus.js";

// mappers
import { toPublicUserDto } from "../users/user.mappers.js";


/**
 * @typedef {Object} ProvisionedAdminUserDto
 * @property {boolean} success
 * @property {boolean} invited
 * @property {import("../ports/users/user.types.js").PublicUserDto | null} payload
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

    if (!existingUser || existingUser.id === null) {
      return {
        success: false,
        invited: false,
        payload: null,
        token: null,
        error: `user with id ${payload.userId} does not exist`,
      };
    }

    const inviteUserAction =
      existingUser.status === UserStatus.NEW ? "create" : "update";

    const { tokenPlaintext, tokenHash } = this.tokenService.generate();
    const ttlDays = 14;
    const expiresAt = this.clockService.addDays(payload.now, ttlDays);

    existingUser.invite({
      inviteTokenHash: tokenHash,
      inviteTokenExpiresAt: expiresAt,
      now: payload.now,
    });

    const invitedUser = await this.userRepository.save(existingUser);

    if (!(invitedUser.inviteTokenExpiresAt instanceof Date)) {
      throw new Error("Invite token expiration not set correctly.");
    }

    const inviteLink = this.tenantLinkBuilderService.buildInviteLink({
      slug: tenant.slug,
      token: tokenPlaintext,
    });

    await this.emailService.sendInviteUserEmail({
      to: invitedUser.email,
      link: inviteLink,
      expiresAt: invitedUser.inviteTokenExpiresAt,
      validityPeriod: `${ttlDays} days`,
    });

    return {
      success: true,
      invited: true,
      payload: toPublicUserDto(invitedUser),
      token: tokenPlaintext,
      error: null,
    };
  }
}
