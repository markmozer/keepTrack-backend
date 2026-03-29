/**
 * File: src/application/users/AcceptInvite.js
 */
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertTokenServicePort } from "../ports/security/TokenServicePort.js";
import { assertClockServicePort } from "../ports/clock/ClockServicePort.js";
import { assertPasswordServicePort } from "../ports/security/PasswordServicePort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validateAcceptInvitePayload } from "./acceptInvite.validation.js";

import { ValidationError } from "../../domain/shared/errors/index.js";

import {
  UserStatus,
  isStatusForAcceptInvite,
} from "../../domain/users/UserStatus.js";

import { toUserAdminDto } from "./user.mappers.js";

export class AcceptInvite {
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
   * @param {import("../ports/users/user.types.js").AcceptInviteUCInput} input
   * @returns {Promise<import("../ports/users/user.types.js").UserAdminDto>}
   */
  async execute(input) {
    const obj = v.object(input, "AcceptInvite input");

    // principal not required in this use case
    const payload = validateAcceptInvitePayload(obj.payload);

    const inviteTokenHash = this.tokenService.hash(payload.tokenPlain);

    const targetUser =
      await this.userRepository.findByInviteTokenHash(inviteTokenHash);

    if (!targetUser) throw new ValidationError("Invite token is invalid.");

    if (!isStatusForAcceptInvite(targetUser.status)) {
      throw new ValidationError(
        "Invite cannot be accepted for current user status.",
      );
    }

    const inviteTokenExpiresAt = v.date(
      targetUser.inviteTokenExpiresAt,
      "inviteTokenExpiresAt",
      { nullable: false },
    );

    const now = this.clockService.now();

    if (inviteTokenExpiresAt <= now) {
      throw new ValidationError("Invite token has expired.");
    }

    const passwordHash = await this.passwordService.hash(payload.passwordPlain);

    const activatedUser = await this.userRepository.activateFromInvite({
      userId: targetUser.id,
      passwordHash,
      inviteTokenHash: null,
      inviteTokenExpiresAt: null,
      status: UserStatus.ACTIVE,
      updatedAt: now,
    });

    return toUserAdminDto(activatedUser);
  }
}
