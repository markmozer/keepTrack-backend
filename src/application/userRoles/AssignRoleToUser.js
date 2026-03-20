/**
 * File: src/application/userRoles/AssignRoleToUser.js
 */
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertRoleRepositoryPort } from "../ports/roles/RoleRepositoryPort.js";
import { assertUserRoleRepositoryPort } from "../ports/userRoles/UserRoleRepositoryPort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { validateAssignRoleToUserPayload } from "./assignRoleToUser.validation.js";

import {
  ResourceNotFoundError,
} from "../../domain/shared/errors/index.js";

import { CrudAction } from "../../domain/authz/authz.types.js";
import { Resource } from "../../domain/authz/authz.types.js";

import { randomUUID } from "node:crypto";
import { toUserRoleDto } from "../userRoles/userRole.mappers.js";

/**
 * @typedef {import("../ports/userRoles/userRole.types.js").AssignRoleToUserUCInput} AssignRoleToUserUCInput
 * @typedef {import("../ports/userRoles/userRole.types.js").AssignRoleToUserDto} AssignRoleToUserDto
 * @typedef {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 * @typedef {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} UserRepositoryPort
 * @typedef {import("../ports/roles/RoleRepositoryPort.js").RoleRepositoryPort} RoleRepositoryPort
 * @typedef {import("../ports/userRoles/UserRoleRepositoryPort.js").UserRoleRepositoryPort} UserRoleRepositoryPort
 * @typedef {import("../authz/AuthorizeAction.js").AuthorizeAction} AuthorizeAction
 */

export class AssignRoleToUser {
  /**
   * @param {{ tenantRepository: TenantRepositoryPort, userRepository: UserRepositoryPort, roleRepository: RoleRepositoryPort, userRoleRepository: UserRoleRepositoryPort, authorizeAction: AuthorizeAction  }} deps
   */
  constructor({
    tenantRepository,
    userRepository,
    roleRepository,
    userRoleRepository,
    authorizeAction,
  }) {
    assertTenantRepositoryPort(tenantRepository);
    assertUserRepositoryPort(userRepository);
    assertRoleRepositoryPort(roleRepository);
    assertUserRoleRepositoryPort(userRoleRepository);
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.userRoleRepository = userRoleRepository;
    this.authorizeAction = authorizeAction;
  }

  /**
   * @param {AssignRoleToUserUCInput} input
   * @returns {Promise<AssignRoleToUserDto>}
   */
  async execute(input) {
    const obj = v.object(input, "AssignRoleToUser input");

    const principal = validatePrincipal(obj.principal);
  
      this.authorizeAction.execute({
      principal,
      action: CrudAction.create,
      resource: Resource.roleAssignment,
      context: { useCase: "AssignRoleToUser" },
    });  
    
       
    const payload = validateAssignRoleToUserPayload(obj.payload);

    const tenantId = principal.tenantId;

    const existingTenant = await this.tenantRepository.findById(
      tenantId,
    );
    if (!existingTenant) {
      throw new ResourceNotFoundError("tenant", {
        tenantId,
      });
    }

    const existingUser = await this.userRepository.findById({
      tenantId,
      userId: payload.targetUserId,
    });

    if (!existingUser) {
      throw new ResourceNotFoundError("user", { userId: payload.targetUserId });
    }

    const existingRole = await this.roleRepository.findById({
      tenantId,
      roleId: payload.roleId,
    });

    if (!existingRole) {
      throw new ResourceNotFoundError("role", { roleId: payload.roleId });
    }

    const existingUserRole = await this.userRoleRepository.findByUserAndRole({
      tenantId,
      userId: payload.targetUserId,
      roleId: payload.roleId,
    });

    if (existingUserRole) {
      return { created: false, payload: toUserRoleDto(existingUserRole) };
    }

    const date = new Date();

    const row = await this.userRoleRepository.create({
      id: randomUUID(),
      tenantId,
      userId: payload.targetUserId,
      roleId: payload.roleId,
      validFrom: payload.validFrom,
      validTo: payload.validTo,
      createdAt: date,
      updatedAt: date,
    });

    return { created: true, payload: toUserRoleDto(row) };
  }
}
