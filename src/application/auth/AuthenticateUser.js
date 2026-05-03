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

import { User } from "../../domain/users/User.js";

/**
 * @typedef {object} LoginDecisionDetails
 * @property {Date | null} [earliestLoginDate]
 */

/**
 *
 * @param {User} user
 * @returns {string}
 */
function requirePasswordHash(user) {
  if (!user.passwordHash) {
    throw new Error("Expected passwordHash");
  }
  return user.passwordHash;
}

/**
 *
 * @param {User} user
 * @returns {string}
 */
function requireUserId(user) {
  if (!user.id) {
    throw new Error("Expected userId");
  }
  return user.id;
}

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

    const now = this.clockService.now();

    const authNDecision = user.canAuthenticate();
    if (!authNDecision.allowed) {
      throw new InvalidCredentialsError();
    }

    const hash = requirePasswordHash(user);
    const userId = requireUserId(user);

    const ok = await this.passwordService.verify(payload.passwordPlain, hash);

    if (!ok) {
      throw new InvalidCredentialsError();
    }

    /** @type {import("../../domain/shared/decision/decision.js").DomainDecision & { details: LoginDecisionDetails | null }} */
    const authZDecision = user.canLogin(now);

    if (!authZDecision.allowed) {
      if (authZDecision.reason !== "USER_HAS_NO_VALID_ROLE") {
        throw new InvalidCredentialsError();
      }

      const earliest = authZDecision.details?.earliestLoginDate ?? null;

      if (earliest === null) {
        throw new NoValidRolesError("User has no valid roles");
      }

      throw new RolesNotYetActiveError("User roles are not yet active.", {
        nextValidFrom: earliest.toISOString(),
      });
    }

    const roleNames = user.getValidRoleNames(now);

    const session = await this.sessionService.createSession({
      userId,
      tenantId: user.tenantId,
      roleNames,
    });

    return {
      sessionId: session.sessionId,
      user: {
        userId: userId,
        tenantId: user.tenantId,
        status: user.status,
        roleNames,
      },
    };
  }
}
