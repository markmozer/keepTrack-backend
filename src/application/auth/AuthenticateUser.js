/**
 * File: src/application/auth/AuthenticateUser.js
 */
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertUserRoleRepositoryPort } from "../ports/userRoles/UserRoleRepositoryPort.js";
import { assertPasswordServicePort } from "../ports/security/PasswordServicePort.js";
import { assertSessionServicePort } from "../ports/session/SessionServicePort.js";
import { assertClockServicePort } from "../ports/clock/ClockServicePort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validateAuthenticateUserPayload } from "./authenticateUser.validation.js";

import {
  InvalidCredentialsError,
  NoValidRolesError,
} from "../../domain/shared/errors/index.js";

import { isStatusForAuthenticateUser } from "../../domain/users/UserStatus.js";

export class AuthenticateUser {
  /**
   * @param {Object} deps
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   * @param {import("../ports/userRoles/UserRoleRepositoryPort.js").UserRoleRepositoryPort} deps.userRoleRepository
   * @param {import("../ports/security/PasswordServicePort.js").PasswordServicePort} deps.passwordService
   * @param {import("../ports/session/SessionServicePort.js").SessionServicePort} deps.sessionService
   * @param {import("../ports/clock/ClockServicePort.js").ClockServicePort} deps.clockService
   */
  constructor({
    userRepository,
    userRoleRepository,
    passwordService,
    sessionService,
    clockService,
  }) {
    assertUserRepositoryPort(userRepository);
    assertUserRoleRepositoryPort(userRoleRepository);
    assertPasswordServicePort(passwordService);
    assertSessionServicePort(sessionService);
    assertClockServicePort(clockService);
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
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

    const validUserRoles = await this.userRoleRepository.findValidByUser({
      tenantId: user.tenantId,
      userId: user.id,
      atDate: this.clockService.now(),
    });

    if (!validUserRoles || validUserRoles.length === 0) {
      throw new NoValidRolesError("User has no valid roles");
    }

    const roleNames = validUserRoles.map((r) => r.role.name);

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
