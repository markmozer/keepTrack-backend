/**
 * File: src/application/provisioning/ProvisionTenantRoles.js
 */


// port assertions
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertRoleRepositoryPort } from "../ports/roles/RoleRepositoryPort.js";

// validation
import { v } from "../../domain/shared/validation/validators.js";
import { validateProvisioningPrincipal } from "../auth/validateProvisioningPrincipal.js";
import { validateProvisionTenantRolesPayload } from "./provisionTenantRoles.validation.js";

// domain
import { getSystemRoles } from "../../domain/authz/getSystemRoles.js";

// mappers
import { toRoleAdminDto } from "../roles/role.mappers.js";

/**
 * @typedef {Object} ProvisionedRoleDto
 * @property {boolean} created
 * @property {import("../ports/roles/role.types.js").RoleAdminDto} role
 */

/**
 * @typedef {Object} ProvisionRolesDto
 * @property {boolean} success
 * @property {ProvisionedRoleDto[] | null} payload
 * @property {any} error
 */

export class ProvisionTenantRoles {
  /**
   * @param {Object} deps
   * @param {import("../ports/roles/RoleRepositoryPort.js").RoleRepositoryPort} deps.roleRepository
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   */
  constructor({ tenantRepository, roleRepository }) {
    assertTenantRepositoryPort(tenantRepository);
    assertRoleRepositoryPort(roleRepository);
    this.tenantRepository = tenantRepository;
    this.roleRepository = roleRepository;
  }

  /**
   * @param {import("../ports/provisioning/provisioning.types.js").ProvisionRolesUCInput} input
   * @returns {Promise<ProvisionRolesDto>}
   */
  async execute(input) {
    const obj = v.object(input, "ProvisionRolesUCInput");

    validateProvisioningPrincipal(obj.principal);
    const payload = validateProvisionTenantRolesPayload(obj.payload);

    const tenant = await this.tenantRepository.findById(payload.tenantId);

    if (!tenant) {
      return {
        success: false,
        payload: null,
        error: `tenant with id ${payload.tenantId} does not exist`
      }
    }

    const roles = getSystemRoles(tenant.type);

    const provisionedRoles = [];

    for (const role of roles) {
      const result = await this.roleRepository.ensure({
        tenantId: tenant.id,
        name: role.name,
        createdAt: payload.now,
        updatedAt: payload.now,
      });

      provisionedRoles.push({
        created: result.createdAt.getTime() === payload.now.getTime(),
        role: toRoleAdminDto(result),
      });
    }

    return {
      success: true,
      payload: provisionedRoles,
      error: null,
    };
  }
}
