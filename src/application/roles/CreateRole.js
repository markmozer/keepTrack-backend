/**
 * File: src/application/roles/CreateRole.js
 */

import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertRoleRepositoryPort } from "../ports/roles/RoleRepositoryPort.js";
import { validateCreateRoleInput } from "./createRole.validation.js";
import { randomUUID } from "node:crypto";

import { ResourceNotFoundError, ConflictError } from "../../domain/shared/errors/index.js";
import { toRoleDto } from "./role.mappers.js";

/**
 * @typedef {import("../ports/roles/role.types.js").CreateRoleUseCaseInput} CreateRoleUseCaseInput
 * @typedef {import("../ports/roles/role.types.js").RoleDto} RoleDto
 * @typedef {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 * @typedef {import("../ports/roles/RoleRepositoryPort.js").RoleRepositoryPort} RoleRepositoryPort
 */


export class CreateRole {
  /**
   * @param {{ tenantRepository: TenantRepositoryPort, roleRepository: RoleRepositoryPort }} deps
   */
  constructor({ tenantRepository, roleRepository }) {
    assertTenantRepositoryPort(tenantRepository);
    assertRoleRepositoryPort(roleRepository);
    this.tenantRepository = tenantRepository;
    this.roleRepository = roleRepository;
  }

  /**
   * @param {CreateRoleUseCaseInput} input
   * @returns {Promise<RoleDto>}
   */
  async execute(input) {
    const roleId = randomUUID();
    const validated = validateCreateRoleInput({
      tenantId: input?.tenantId,
      name: input?.name,
    });

    const existingTenant = await this.tenantRepository.findById(validated.tenantId);
    if (!existingTenant) {
      throw new ResourceNotFoundError("tenant", {tenantId: validated.tenantId})
    };

    const existingRole = await this.roleRepository.findByName({
      tenantId: validated.tenantId,
      name: validated.name,
    });

    if (existingRole) {
      throw new ConflictError(`Role '${validated.name}' already exists.`);
    }

    const date = new Date();

    const row = await this.roleRepository.create({
      id: randomUUID(),
      tenantId: validated.tenantId,
      name: validated.name,
      createdAt: date,
      updatedAt: date,
    });

    return toRoleDto(row);
  }
}
