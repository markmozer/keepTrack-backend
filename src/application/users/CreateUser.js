/**
 * File: src/application/users/CreateUser.js
 */

import { v } from "../../domain/shared/validation/validators.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { validateCreateUserPayload } from "./createUser.validation.js";

import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";

import {
  ResourceNotFoundError,
  ConflictError,
} from "../../domain/shared/errors/index.js";

import { randomUUID } from "node:crypto";
import { UserStatus } from "../../domain/users/UserStatus.js";
import { toUserDtoPublic } from "./user.mappers.js";

/**
 * @typedef {import("../ports/users/user.types.js").CreateUserUCInput} CreateUserUCInput
 * @typedef {import("../ports/users/user.types.js").UserDtoPublic} UserDtoPublic
 * @typedef {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 * @typedef {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} UserRepositoryPort
 */

export class CreateUser {
  /**
   * @param {{ tenantRepository: TenantRepositoryPort, userRepository: UserRepositoryPort }} deps
   */
  constructor({ tenantRepository, userRepository }) {
    assertTenantRepositoryPort(tenantRepository);
    assertUserRepositoryPort(userRepository);
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
  }

  /**
   * @param {CreateUserUCInput} input
   * @returns {Promise<UserDtoPublic>}
   */
  async execute(input) {
    const obj = v.object(input, "CreateUser input");

    const principal = validatePrincipal(obj.principal);
    const payload = validateCreateUserPayload(obj.payload);

    const tenantId = principal.tenantId;

    const existingTenant = await this.tenantRepository.findById(
      tenantId,
    );
    if (!existingTenant) {
      throw new ResourceNotFoundError("tenant", {
        tenantId: tenantId,
      });
    }

    const existingUser = await this.userRepository.findByEmail({
      tenantId,
      email: payload.email,
    });

    if (existingUser) {
      throw new ConflictError(`User '${payload.email}' already exists.`);
    }

    const date = new Date();

    const row = await this.userRepository.create({
      id: randomUUID(),
      tenantId: tenantId,
      email: payload.email,
      status: UserStatus.NEW,
      createdAt: date,
      updatedAt: date,
    });

    return toUserDtoPublic(row);
  }
}
