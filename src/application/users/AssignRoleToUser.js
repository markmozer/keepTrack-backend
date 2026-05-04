/**
 * File: src/application/userRoles/AssignRoleToUser.js
 */
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertRoleRepositoryPort } from "../ports/roles/RoleRepositoryPort.js";
import { assertUserRoleRepositoryPort } from "../ports/userRoles/UserRoleRepositoryPort.js";
import { assertClockServicePort } from "../ports/clock/ClockServicePort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { validateAssignRoleToUserPayload } from "./assignRoleToUser.validation.js";

import { ResourceNotFoundError } from "../../domain/shared/errors/index.js";

import { CrudAction } from "../../domain/authz/authz.types.js";
import { Resource } from "../../domain/authz/authz.types.js";

import { toPublicUserDto } from "./user.mappers.js";

export class AssignRoleToUser {
  /**
   * @param {Object} deps
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   * @param {import("../ports/roles/RoleRepositoryPort.js").RoleRepositoryPort} deps.roleRepository
   * @param {import("../ports/userRoles/UserRoleRepositoryPort.js").UserRoleRepositoryPort} deps.userRoleRepository
   * @param {import("../ports/clock/ClockServicePort.js").ClockServicePort} deps.clockService
   * @param {import("../authz/AuthorizeAction.js").AuthorizeAction} deps.authorizeAction
   */
  constructor({
    tenantRepository,
    userRepository,
    roleRepository,
    userRoleRepository,
    clockService,
    authorizeAction,
  }) {
    assertTenantRepositoryPort(tenantRepository);
    assertUserRepositoryPort(userRepository);
    assertRoleRepositoryPort(roleRepository);
    assertUserRoleRepositoryPort(userRoleRepository);
    assertClockServicePort(clockService);
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.userRoleRepository = userRoleRepository;
    this.clockService = clockService;
    this.authorizeAction = authorizeAction;
  }

  /**
   * @param {import("../ports/users/user.types.js").AssignRoleToUserUCInput} input
   * @returns {Promise<import("../ports/users/user.types.js").AssignRoleToUserDto>}
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

    const existingTenant = await this.tenantRepository.findById(tenantId);
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

    const now = this.clockService.now();

    const newUserRole = existingUser.assignRole({
      roleId: payload.roleId,
      validFrom: payload.validFrom,
      validTo: payload.validTo,
      now,
    });

    if (!newUserRole) {
      return { created: false, payload: toPublicUserDto(existingUser) };
    }

    const persistedUserRole = await this.userRoleRepository.create(newUserRole);

    existingUser.replaceUserRole(newUserRole, persistedUserRole);


    return { created: true, payload: toPublicUserDto(existingUser) };
  }
}
