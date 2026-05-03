/**
 * File: src/application/users/ForgotPassword.js
 */

import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertTokenServicePort } from "../ports/security/TokenServicePort.js";
import { assertEmailServicePort } from "../ports/email/EmailServicePort.js";
import { assertClockServicePort } from "../ports/clock/ClockServicePort.js";
import { assertTenantLinkBuilderServicePort } from "../ports/urls/TenantLinkBuilderServicePort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validateForgotPasswordPayload } from "./forgotPassword.validation.js";

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

export class ForgotPassword {
  /**
   * @param {Object} deps
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   * @param {import("../ports/security/TokenServicePort.js").TokenServicePort} deps.tokenService
   * @param {import("../ports/clock/ClockServicePort.js").ClockServicePort} deps.clockService
   * @param {import("../ports/email/EmailServicePort.js").EmailServicePort} deps.emailService
   * @param {import("../ports/urls/TenantLinkBuilderServicePort.js").TenantLinkBuilderServicePort} deps.tenantLinkBuilderService
   * @param {Config} deps.config
   */
  constructor({
    tenantRepository,
    userRepository,
    tokenService,
    emailService,
    clockService,
    tenantLinkBuilderService,
    config,
  }) {
    assertTenantRepositoryPort(tenantRepository);
    assertUserRepositoryPort(userRepository);
    assertTokenServicePort(tokenService);
    assertEmailServicePort(emailService);
    assertClockServicePort(clockService);
    assertTenantLinkBuilderServicePort(tenantLinkBuilderService);

    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.emailService = emailService;
    this.clockService = clockService;
    this.tenantLinkBuilderService = tenantLinkBuilderService;
    this.config = config;
  }

  /**
   * @param {import("../ports/users/user.types.js").ForgotPasswordUCInput} input
   * @returns {Promise<GenericAuthResponseDto>}
   */
  async execute(input) {
    const obj = v.object(input, "ForgotPassword input");
    const payload = validateForgotPasswordPayload(obj.payload);

    const { tenantId, email } = payload;

    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) return genericAuthResponse();

    const user = await this.userRepository.findByEmailForAuth({
      tenantId,
      email,
    });

    if (!user) return genericAuthResponse();

    const now = this.clockService.now();

    const decision = user.canRequestPasswordReset(now);

    if (!decision.allowed) {
      return genericAuthResponse();
    }

    const { tokenPlaintext, tokenHash } = this.tokenService.generate();

    const ttlMinutes = this.config?.resetTtlMinutes ?? 15;
    const expiresAt = this.clockService.addMinutes(now, ttlMinutes);
    const validityPeriod = `${ttlMinutes} minutes`;

    user.requestPasswordReset({
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: expiresAt,
      now,
    });

    const updatedUser = await this.userRepository.save(user);

    if (!(updatedUser.resetTokenExpiresAt instanceof Date)) {
      throw new Error(
        "Password reset token expiration must be set before sending email",
      );
    }

    const resetLink = this.tenantLinkBuilderService.buildPasswordResetLink({
      slug: tenant.slug,
      token: tokenPlaintext,
    });

    try {
      await this.emailService.sendPasswordResetEmail({
        to: updatedUser.email,
        link: resetLink,
        expiresAt: updatedUser.resetTokenExpiresAt,
        validityPeriod,
      });
    } catch (err) {
      try {
        updatedUser.clearPasswordReset();
        await this.userRepository.save(updatedUser);
      } catch (rollbackError) {
        console.error("ForgotPassword rollback failed", rollbackError);
      }

      throw err;
    }

    return genericAuthResponse();
  }
}