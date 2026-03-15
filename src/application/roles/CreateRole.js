/**
 * File: src/application/roles/CreateRole.js
 */
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertRoleRepositoryPort } from "../ports/roles/RoleRepositoryPort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { validateCreateRolePayload } from "./createRole.validation.js";


import { randomUUID } from "node:crypto";

import { ResourceNotFoundError, ConflictError } from "../../domain/shared/errors/index.js";

import { toRoleDto } from "./role.mappers.js";

/**
 * @typedef {import("../ports/roles/role.types.js").CreateRoleUCInput} CreateRoleUCInput
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
   * @param {CreateRoleUCInput} input
   * @returns {Promise<RoleDto>}
   */
  async execute(input) {
    const obj = v.object(input, "CreateUser input");

    const principal = validatePrincipal(obj.principal);
    const payload = validateCreateRolePayload(obj.payload);

    const existingTenant = await this.tenantRepository.findById(principal.tenantId);
    if (!existingTenant) {
      throw new ResourceNotFoundError("tenant", {tenantId: principal.tenantId})
    };

    const existingRole = await this.roleRepository.findByName({
      tenantId: principal.tenantId,
      name: payload.name,
    });

    if (existingRole) {
      throw new ConflictError(`Role '${payload.name}' already exists.`);
    }

    const date = new Date();

    const row = await this.roleRepository.create({
      id: randomUUID(),
      tenantId: principal.tenantId,
      name: payload.name,
      createdAt: date,
      updatedAt: date,
    });

    return toRoleDto(row);
  }
}
