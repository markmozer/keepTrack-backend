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
import { toUserDtoPublic } from "./user.mappers.js";

/**
 * @typedef {import("../ports/users/user.types.js").AcceptInviteUCInput} AcceptInviteUCInput
 * @typedef {import("../ports/users/user.types.js").UserDtoPublic} UserDtoPublic
 * @typedef {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} UserRepositoryPort
 * @typedef {import("../ports/security/TokenServicePort.js").TokenServicePort} TokenServicePort
 * @typedef {import("../ports/clock/ClockServicePort.js").ClockServicePort} ClockServicePort
 * @typedef {import("../ports/security/PasswordServicePort.js").PasswordServicePort} PasswordServicePort
 */

export class AcceptInvite {
  /**
   * @param {{
   *    userRepository: UserRepositoryPort,
   *    tokenService: TokenServicePort,
   *    clockService: ClockServicePort,
   *    passwordService: PasswordServicePort
   *  }} deps
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
   * @param {AcceptInviteUCInput} input
   * @returns {Promise<UserDtoPublic>}
   */
  async execute(input) {
    const obj = v.object(input, "AcceptInvite input");

    // principal not required in this use case
    const payload = validateAcceptInvitePayload(obj.payload);

    const inviteTokenHash = this.tokenService.hash(payload.tokenPlain);

    const targetUser = await this.userRepository.findByInviteTokenHash(
      inviteTokenHash
    );

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

    return toUserDtoPublic(activatedUser);
  }
}
