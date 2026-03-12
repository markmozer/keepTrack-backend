/**
 * File: src/application/userRoles/AssignRoleToUser.js
 */


import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertRoleRepositoryPort } from "../ports/roles/RoleRepositoryPort.js";
import { assertUserRoleRepositoryPort } from "../ports/userRoles/UserRoleRepositoryPort.js";
import { validateAssignRoleToUserInput } from "./assignRoleToUser.validation.js";
import { randomUUID } from "node:crypto";

import {
  ResourceNotFoundError,
  ConflictError,
} from "../../domain/shared/errors/index.js";
import { toUserRoleDtoPublic } from "../userRoles/userRole.mappers.js";

/**
 * @typedef {import("../ports/userRoles/userRole.types.js").AssignRoleToUserUseCaseInput} AssignRoleToUserUseCaseInput
 * @typedef {import("../ports/userRoles/userRole.types.js").AssignRoleToUserDto} AssignRoleToUserDto
 * @typedef {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 * @typedef {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} UserRepositoryPort
 * @typedef {import("../ports/roles/RoleRepositoryPort.js").RoleRepositoryPort} RoleRepositoryPort
 * @typedef {import("../ports/userRoles/UserRoleRepositoryPort.js").UserRoleRepositoryPort} UserRoleRepositoryPort
 */

export class AssignRoleToUser {
  /**
   * @param {{ tenantRepository: TenantRepositoryPort, userRepository: UserRepositoryPort, roleRepository: RoleRepositoryPort, userRoleRepository: UserRoleRepositoryPort }} deps
   */
  constructor({
    tenantRepository,
    userRepository,
    roleRepository,
    userRoleRepository,
  }) {
    assertTenantRepositoryPort(tenantRepository);
    assertUserRepositoryPort(userRepository);
    assertRoleRepositoryPort(roleRepository);
    assertUserRoleRepositoryPort(userRoleRepository);
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.userRoleRepository = userRoleRepository;
  }

  /**
   * @param {AssignRoleToUserUseCaseInput} input
   * @returns {Promise<AssignRoleToUserDto>}
   */
  async execute(input) {
    const validated = validateAssignRoleToUserInput({
      tenantId: input?.tenantId,
      userId: input?.userId,
      roleId: input?.roleId,
      validFrom: input?.validFrom,
      validTo: input?.validTo,
    });

    const existingTenant = await this.tenantRepository.findById(
      validated.tenantId,
    );
    if (!existingTenant) {
      throw new ResourceNotFoundError("tenant", {
        tenantId: validated.tenantId,
      });
    }

    const existingUser = await this.userRepository.findById({
      tenantId: validated.tenantId,
      userId: validated.userId,
    });

    if (!existingUser) {
      throw new ResourceNotFoundError("user", { userId: validated.userId });
    }

    const existingRole = await this.roleRepository.findById({
      tenantId: validated.tenantId,
      roleId: validated.roleId,
    });

    if (!existingRole) {
      throw new ResourceNotFoundError("role", { roleId: validated.roleId });
    }

    const existingUserRole = await this.userRoleRepository.findByUserAndRole({ 
      tenantId: validated.tenantId, 
      userId: validated.userId, 
      roleId: validated.roleId
    });

    if (existingUserRole) {
      return { created: false, payload: toUserRoleDtoPublic(existingUserRole) };
    }

    const date = new Date();

    const row = await this.userRoleRepository.create({
      id: randomUUID(),
      tenantId: validated.tenantId,
      userId: validated.userId,
      roleId: validated.roleId,
      validFrom: validated.validFrom,
      validTo: validated.validTo,
      createdAt: date,
      updatedAt: date,
    });

    return {created: true, payload: toUserRoleDtoPublic(row)};
  }
}
