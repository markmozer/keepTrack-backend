/**
 * File: src/application/auth/AuthenticateUser.js
 */
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertUserRoleRepositoryPort } from "../ports/userRoles/UserRoleRepositoryPort.js";
import { assertPasswordServicePort } from "../ports/security/PasswordServicePort.js";
import { assertSessionServicePort } from "../ports/session/SessionServicePort.js";
import { assertClockServicePort } from "../ports/clock/ClockServicePort.js";
import { validateAuthenticateUserPayload } from "./authenticateUser.validation.js";
import {
  InvalidCredentialsError,
  NoValidRolesError,
} from "../../domain/shared/errors/index.js";
import { UserStatus } from "../../domain/users/UserStatus.js";

/**
 * @typedef {import("../ports/auth/auth.types.js").AuthenticateUserUCInput} AuthenticateUserUCInput
 * @typedef {import("../ports/auth/auth.types.js").AuthenticationResultDto} AuthenticationResultDto
 *
 * @typedef {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} UserRepositoryPort
 * @typedef {import("../ports/userRoles/UserRoleRepositoryPort.js").UserRoleRepositoryPort} UserRoleRepositoryPort
 * @typedef {import("../ports/security/PasswordServicePort.js").PasswordServicePort} PasswordServicePort
 * @typedef {import("../ports/session/SessionServicePort.js").SessionServicePort} SessionServicePort
 * @typedef {import("../ports/clock/ClockServicePort.js").ClockServicePort} ClockServicePort
 */

export class AuthenticateUser {
  /**
   * @param {{
   * userRepository: UserRepositoryPort,
   * userRoleRepository: UserRoleRepositoryPort,
   * passwordService: PasswordServicePort,
   * sessionService: SessionServicePort,
   * clockService: ClockServicePort,
   *  }} deps
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
   * @param {AuthenticateUserUCInput} input
   * @returns {Promise<AuthenticationResultDto>}
   */
  async execute(input) {
    const validated = validateAuthenticateUserPayload(input?.payload);

    const user = await this.userRepository.findByEmailForAuth({
      tenantId: validated.tenantId,
      email: validated.email,
    });

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new InvalidCredentialsError();
    }

    if (!user.passwordHash) {
      throw new InvalidCredentialsError();
    }

    const ok = await this.passwordService.verify(
      validated.passwordPlain,
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

    console.log(validUserRoles);

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
