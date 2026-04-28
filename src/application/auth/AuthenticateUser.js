/**
 * File: src/application/auth/AuthenticateUser.js
 */
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertPasswordServicePort } from "../ports/security/PasswordServicePort.js";
import { assertSessionServicePort } from "../ports/session/SessionServicePort.js";
import { assertClockServicePort } from "../ports/clock/ClockServicePort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validateAuthenticateUserPayload } from "./authenticateUser.validation.js";

import {
  InvalidCredentialsError,
  NoValidRolesError,
  RolesNotYetActiveError,
} from "../../domain/shared/errors/index.js";

import { isStatusForAuthenticateUser } from "../../domain/users/UserStatus.js";
import {
  getNextRoleEffectiveAt,
  hasRoleEffectiveAt,
  hasRoleEffectiveNowOrFuture,
} from "../../domain/authz/userRoleValidity.js";

export class AuthenticateUser {
  /**
   * @param {Object} deps
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   * @param {import("../ports/security/PasswordServicePort.js").PasswordServicePort} deps.passwordService
   * @param {import("../ports/session/SessionServicePort.js").SessionServicePort} deps.sessionService
   * @param {import("../ports/clock/ClockServicePort.js").ClockServicePort} deps.clockService
   */
  constructor({
    userRepository,
    passwordService,
    sessionService,
    clockService,
  }) {
    assertUserRepositoryPort(userRepository);
    assertPasswordServicePort(passwordService);
    assertSessionServicePort(sessionService);
    assertClockServicePort(clockService);
    this.userRepository = userRepository;
    this.passwordService = passwordService;
    this.sessionService = sessionService;
    this.clockService = clockService;
  }
  /**
   *
   * @param {import("../ports/auth/auth.types.js").AuthenticateUserUCInput} input
   * @returns {Promise<import("../ports/auth/auth.types.js").AuthenticationResultDto>}
   */
  async execute(input) {
    const obj = v.object(input, "AuthenticateUser input");

    const payload = validateAuthenticateUserPayload(obj.payload);

    const user = await this.userRepository.findByEmailForAuth({
      tenantId: payload.tenantId,
      email: payload.email,
    });

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!isStatusForAuthenticateUser(user.status)) {
      throw new InvalidCredentialsError();
    }

    if (!user.passwordHash) {
      throw new InvalidCredentialsError();
    }

    const ok = await this.passwordService.verify(
      payload.passwordPlain,
      user.passwordHash,
    );

    if (!ok) {
      throw new InvalidCredentialsError();
    }

    const now = this.clockService.now();
    const authUserRoles = user.userRoles ?? [];

    if (!hasRoleEffectiveAt(authUserRoles, now)) {
      if (hasRoleEffectiveNowOrFuture(authUserRoles, now)) {
        const nextValidFrom = getNextRoleEffectiveAt(authUserRoles, now);

        throw new RolesNotYetActiveError(
          "User roles are not yet active.",
          nextValidFrom
            ? { nextValidFrom: nextValidFrom.toISOString() }
            : undefined,
        );
      }

      throw new NoValidRolesError("User has no valid roles");
    }

    const roleNames = authUserRoles
      .filter((role) => hasRoleEffectiveAt([role], now))
      .map((r) => r.role.name);

    const session = await this.sessionService.createSession({
      userId: user.id,
      tenantId: user.tenantId,
      roleNames,
    });

    return {
      sessionId: session.sessionId,
      user: {
        userId: user.id,
        tenantId: user.tenantId,
        status: user.status,
        roleNames,
      },
    };
  }
}
