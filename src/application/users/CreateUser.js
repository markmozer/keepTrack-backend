/**
 * File: src/application/users/CreateUser.js
 */


import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { validateCreateUserInput } from "./createUser.validation.js";
import { randomUUID } from "node:crypto";

import { ResourceNotFoundError, ConflictError } from "../../domain/shared/errors/index.js";
import { UserStatus } from "../../domain/users/UserStatus.js";
import { toUserDtoPublic } from "./user.mappers.js";

/**
 * @typedef {import("../ports/users/user.types.js").CreateUserUseCaseInput} CreateUserUseCaseInput
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
   * @param {CreateUserUseCaseInput} input
   * @returns {Promise<UserDtoPublic>}
   */
  async execute(input) {
    const validated = validateCreateUserInput({
      tenantId: input?.tenantId,
      email: input?.email,
    });

    const existingTenant = await this.tenantRepository.findById(validated.tenantId);
    if (!existingTenant) {
      throw new ResourceNotFoundError("tenant", {tenantId: validated.tenantId})
    };

    const existingUser = await this.userRepository.findByEmail({
      tenantId: validated.tenantId,
      email: validated.email,
    });

    if (existingUser) {
      throw new ConflictError(`User '${validated.email}' already exists.`);
    }

    const date = new Date();
    
    const row = await this.userRepository.create({
      id: randomUUID(),
      tenantId: validated.tenantId,
      email: validated.email,
      status: UserStatus.NEW,
      createdAt: date,
      updatedAt: date,
    });

    return toUserDtoPublic(row);
  }
}
