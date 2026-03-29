/**
 * File: src/application/users/RequestPasswordReset.js
 */

import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertUserRoleRepositoryPort } from "../ports/userRoles/UserRoleRepositoryPort.js";
import { assertTokenServicePort } from "../ports/security/TokenServicePort.js";
import { assertEmailServicePort } from "../ports/email/EmailServicePort.js";
import { assertClockServicePort } from "../ports/clock/ClockServicePort.js";
import { assertTenantLinkBuilderServicePort } from "../ports/urls/TenantLinkBuilderServicePort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validateRequestPasswordResetPayload } from "./requestPasswordReset.validation.js";

import { isStatusForRequestPasswordReset } from "../../domain/users/UserStatus.js";


/**
 * @typedef {Object} Config
 * @property {number} resetTtlMinutes
 */

/**
 * @typedef {Object} GenericAuthResponseDto
 * @property {string} message
 */

function genericAuthResponse() {
  return {
    message:
      "Als dit email adres bestaat, ontvangt u een email met een password reset link.",
  };
}

export class RequestPasswordReset {
  /**
   * @param {Object} deps
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   * @param {import("../ports/userRoles/UserRoleRepositoryPort.js").UserRoleRepositoryPort} deps.userRoleRepository
   * @param {import("../ports/security/TokenServicePort.js").TokenServicePort} deps.tokenService
   * @param {import("../ports/clock/ClockServicePort.js").ClockServicePort} deps.clockService
   * @param {import("../ports/email/EmailServicePort.js").EmailServicePort} deps.emailService
   * @param {import("../ports/urls/TenantLinkBuilderServicePort.js").TenantLinkBuilderServicePort} deps.tenantLinkBuilderService
   * @param {Config} deps.config
   */
  constructor({
    tenantRepository,
    userRepository,
    userRoleRepository,
    tokenService,
    emailService,
    clockService,
    tenantLinkBuilderService,
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
    this.config = config;
  }

  /**
   *
   * @param {import("../ports/users/user.types.js").RequestPasswordResetUCInput} input
   * @returns {Promise<GenericAuthResponseDto>}
   */
  async execute(input) {
    const obj = v.object(input, "RequestPasswordReset input");

    // No principal required for this Use-Case

    const payload = validateRequestPasswordResetPayload(obj.payload);

    const { tenantId, email } = payload;

    try {
      const existingTenant = await this.tenantRepository.findById(tenantId);
      if (!existingTenant) return genericAuthResponse();

      const existingUser = await this.userRepository.findByEmail({
        tenantId,
        email,
      });

      if (!existingUser) return genericAuthResponse();

      if (!isStatusForRequestPasswordReset(existingUser.status))
        return genericAuthResponse();

      const assignedRoles = await this.userRoleRepository.findByUser({
        tenantId,
        userId: existingUser.id,
      });

      if (!assignedRoles || assignedRoles.length === 0)
        return genericAuthResponse();

      const now = this.clockService.now();
      const hasValidRoleNowOrFuture = assignedRoles.some(
        (r) => !r.validTo || new Date(r.validTo) >= now,
      );
      if (!hasValidRoleNowOrFuture) {
        return genericAuthResponse();
      }

      const { tokenPlaintext, tokenHash } = this.tokenService.generate();
      const ttlMinutes = this.config?.resetTtlMinutes ?? 15;
      const expiresAt = this.clockService.addMinutes(now, ttlMinutes);
      const validityPeriod = `${ttlMinutes} minutes`;

      const updated = await this.userRepository.markAsPwdResetRequested({
        userId: existingUser.id,
        tenantId,
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: expiresAt,
        updatedAt: now,
      });

      // make sure that expiredAt is a valid date
      if (!(updated.resetTokenExpiresAt instanceof Date)) {
        throw new Error(
          "Password reset token expiration must be set before sending email",
        );
      }

      const resetLink = this.tenantLinkBuilderService.buildPasswordResetLink({
        slug: existingTenant.slug,
        token: tokenPlaintext,
      });

      await this.emailService.sendPasswordResetEmail({
        to: updated.email,
        link: resetLink,
        expiresAt: updated.resetTokenExpiresAt,
        validityPeriod,
      });

      return genericAuthResponse();
    } catch (err) {
      console.error("RequestPasswordReset failed", err);
      return genericAuthResponse();
    }
  }
}
