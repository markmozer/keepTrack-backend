/**
 * File: src/application/provisioning/ProvisionTenantAdminUserRole.js
 */

// port assertions
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertRoleRepositoryPort } from "../ports/roles/RoleRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertUserRoleRepositoryPort } from "../ports/userRoles/UserRoleRepositoryPort.js";

// validation
import { v } from "../../domain/shared/validation/validators.js";
import { validateProvisioningPrincipal } from "../auth/validateProvisioningPrincipal.js";
import { validateProvisionTenantAdminUserRolePayload } from "./provisionTenantAdminUserRole.validation.js";

// domain
import { UserStatus } from "../../domain/users/UserStatus.js";

// mappers
import { toPublicUserDto } from "../users/user.mappers.js";

// other
import { ConflictError } from "../../domain/shared/errors/index.js";

/**
 * @typedef {Object} ProvisionedAdminUserDto
 * @property {boolean} success
 * @property {boolean} created
 * @property {import("../ports/users/user.types.js").PublicUserDto | null} payload
 * @property {any} error
 */

export class ProvisionTenantAdminUserRole {
  /**
   * @param {Object} deps
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   * @param {import("../ports/roles/RoleRepositoryPort.js").RoleRepositoryPort} deps.roleRepository
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   * @param {import("../ports/userRoles/UserRoleRepositoryPort.js").UserRoleRepositoryPort} deps.userRoleRepository
   */
  constructor({
    tenantRepository,
    roleRepository,
    userRepository,
    userRoleRepository,
  }) {
    assertTenantRepositoryPort(tenantRepository);
    assertRoleRepositoryPort(roleRepository);
    assertUserRepositoryPort(userRepository);
    assertUserRoleRepositoryPort(userRoleRepository);
    this.tenantRepository = tenantRepository;
    this.roleRepository = roleRepository;
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
  }

  /**
   * @param {import("../ports/provisioning/provisioning.types.js").ProvisionTenantAdminUserRoleUCInput} input
   * @returns {Promise<ProvisionedAdminUserDto>}
   */
  async execute(input) {
    const obj = v.object(input, "ProvisionTenantAdminUserRoleUCInput");

    validateProvisioningPrincipal(obj.principal);
    const payload = validateProvisionTenantAdminUserRolePayload(obj.payload);

    const tenant = await this.tenantRepository.findById(payload.tenantId);

    if (!tenant) {
      return {
        success: false,
        created: false,
        payload: null,
        error: `tenant with id ${payload.tenantId} does not exist`,
      };
    }

    const user = await this.userRepository.findById({
      tenantId: tenant.id,
      userId: payload.userId,
    });

    if (!user || user.id === null) {
      return {
        success: false,
        created: false,
        payload: null,
        error: `user with id ${payload.userId} does not exist`,
      };
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new ConflictError(
        `user with id ${user.id} exists but is inactive.`,
      );
    }

    const role = await this.roleRepository.findByName({
      tenantId: tenant.id,
      name: payload.roleName,
    });

    if (!role) {
      return {
        success: false,
        created: false,
        payload: null,
        error: `role with name ${payload.roleName} not found`,
      };
    }

    const newUserRole = user.assignRole({
      roleId: role.id,
      validFrom: payload.now,
      validTo: null,
      now: payload.now,
    });

    if (!newUserRole) {
      const existingUserRole = user.userRoles.filter((ur) => {
        return ur.roleId === role.id;
      });
      if (!existingUserRole || existingUserRole.length === 0)
        throw new Error("Problem creating new UserRole");
      if (
        existingUserRole[0].validFrom > payload.now ||
        (existingUserRole[0].validTo !== null && existingUserRole[0].validTo < payload.now)
      ) {
        return {
          success: false,
          created: false,
          payload: null,
          error: `userRole out of validity: validFrom: ${existingUserRole[0].validFrom} validTo: ${existingUserRole[0].validTo}`,
        };
      }
      return {
        success: true,
        created: false,
        payload: toPublicUserDto(user),
        error: null,
      };
    }

    const persistedUserRole = await this.userRoleRepository.create(newUserRole);

    user.replaceUserRole(newUserRole, persistedUserRole);

    return {
      success: true,
      created: true,
      payload: toPublicUserDto(user),
      error: null,
    };
  }
}
