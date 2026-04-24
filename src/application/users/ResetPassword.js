/**
 * File: src/application/users/ResetPassword.js
 */

import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertTokenServicePort } from "../ports/security/TokenServicePort.js";
import { assertClockServicePort } from "../ports/clock/ClockServicePort.js";
import { assertPasswordServicePort } from "../ports/security/PasswordServicePort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validateResetPasswordPayload } from "./resetPassword.validation.js";

import { ValidationError } from "../../domain/shared/errors/index.js";

import {
  isStatusForResetPassword,
} from "../../domain/users/UserStatus.js";

import { toUserDetailDto } from "./user.mappers.js";

export class ResetPassword {
  /**
   * @param {Object} deps
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   * @param {import("../ports/security/TokenServicePort.js").TokenServicePort} deps.tokenService
   * @param {import("../ports/clock/ClockServicePort.js").ClockServicePort} deps.clockService
   * @param {import("../ports/security/PasswordServicePort.js").PasswordServicePort} deps.passwordService
   */
  constructor({ userRepository, tokenService, clockService, passwordService }) {
    assertUserRepositoryPort(userRepository);
    assertTokenServicePort(tokenService);
    assertClockServicePort(clockService);
    assertPasswordServicePort(passwordService);
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.clockService = clockService;
    this.passwordService = passwordService;
  }

  /**
   * @param {import("../ports/users/user.types.js").ResetPasswordUCInput} input
   * @returns {Promise<import("../ports/users/user.types.js").UserDetailDto>}
   */
  async execute(input) {
    const obj = v.object(input, "ResetPassword input");

    // principal not required in this use case
    const payload = validateResetPasswordPayload(obj.payload);

    const resetTokenHash = this.tokenService.hash(payload.tokenPlain);

    const targetUser = await this.userRepository.findByResetTokenHash({
      tenantId: payload.tenantId,
      resetTokenHash,
    });

    if (!targetUser) throw new ValidationError("Invite token is invalid.");

    if (!isStatusForResetPassword(targetUser.status)) {
      throw new ValidationError(
        "Invite cannot be accepted for current user status.",
      );
    }

    const resetTokenExpiresAt = v.date(
      targetUser.resetTokenExpiresAt,
      "resetTokenExpiresAt",
      { nullable: false },
    );

    const now = this.clockService.now();

    if (resetTokenExpiresAt <= now) {
      throw new ValidationError("Invite token has expired.");
    }

    const passwordHash = await this.passwordService.hash(payload.passwordPlain);

    const resetUser = await this.userRepository.resetPassword({
      userId: targetUser.id,
      passwordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      updatedAt: now,
    });

    return toUserDetailDto(resetUser);
  }
}
