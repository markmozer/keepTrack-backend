/**
 * File: src/application/users/CreateUser.js
 */
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { validateCreateUserPayload } from "./createUser.validation.js";

import {
  ResourceNotFoundError,
  ConflictError,
} from "../../domain/shared/errors/index.js";

import { CrudAction } from "../../domain/authz/authz.types.js";
import { Resource } from "../../domain/authz/authz.types.js";

import { User } from "../../domain/users/User.js";

import { toPublicUserDto } from "./user.mappers.js";

export class CreateUser {
  /**
   * @param {object} deps
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   * @param {import("../authz/AuthorizeAction.js").AuthorizeAction} deps.authorizeAction
   */
  constructor({ tenantRepository, userRepository, authorizeAction }) {
    assertTenantRepositoryPort(tenantRepository);
    assertUserRepositoryPort(userRepository);
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.authorizeAction = authorizeAction;
  }

  /**
   * @param {import("../ports/users/user.types.js").CreateUserUCInput} input
   * @returns {Promise<import("../ports/users/user.types.js").UserDetailDto>}
   */
  async execute(input) {
    const obj = v.object(input, "CreateUser input");

    const principal = validatePrincipal(obj.principal);

    this.authorizeAction.execute({
      principal,
      action: CrudAction.create,
      resource: Resource.user,
      context: { useCase: "CreateUser" },
    });


    const payload = validateCreateUserPayload(obj.payload);

    const tenantId = principal.tenantId;

    const existingTenant = await this.tenantRepository.findById(tenantId);
    if (!existingTenant) {
      throw new ResourceNotFoundError("tenant", {
        tenantId: tenantId,
      });
    };

    const existingUser = await this.userRepository.findByEmail({
      tenantId,
      email: payload.email,
    });

    if (existingUser) {
      throw new ConflictError(`User '${payload.email}' already exists.`);
    }

    const user = User.createNew({tenantId, email: payload.email, now: new Date()});

    const persistedUser = await this.userRepository.create(user);

    return toPublicUserDto(persistedUser);
  }
}
