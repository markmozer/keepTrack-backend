/**
 * File: src/application/roles/CreateRole.js
 */
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertRoleRepositoryPort } from "../ports/roles/RoleRepositoryPort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { validateCreateRolePayload } from "./createRole.validation.js";

import { ResourceNotFoundError, ConflictError } from "../../domain/shared/errors/index.js";

import { CrudAction } from "../../domain/authz/authz.types.js";
import { Resource } from "../../domain/authz/authz.types.js";

import { randomUUID } from "node:crypto";
import { toRoleDto } from "./role.mappers.js";

/**
 * @typedef {import("../ports/roles/role.types.js").CreateRoleUCInput} CreateRoleUCInput
 * @typedef {import("../ports/roles/role.types.js").RoleDto} RoleDto
 * @typedef {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 * @typedef {import("../ports/roles/RoleRepositoryPort.js").RoleRepositoryPort} RoleRepositoryPort
 * @typedef {import("../authz/AuthorizeAction.js").AuthorizeAction} AuthorizeAction
 */


export class CreateRole {
  /**
   * @param {{ tenantRepository: TenantRepositoryPort, roleRepository: RoleRepositoryPort, authorizeAction: AuthorizeAction }} deps
   */
  constructor({ tenantRepository, roleRepository, authorizeAction }) {
    assertTenantRepositoryPort(tenantRepository);
    assertRoleRepositoryPort(roleRepository);
    this.tenantRepository = tenantRepository;
    this.roleRepository = roleRepository;
    this.authorizeAction = authorizeAction;
  }

  /**
   * @param {CreateRoleUCInput} input
   * @returns {Promise<RoleDto>}
   */
  async execute(input) {
    const obj = v.object(input, "CreateUser input");

    const principal = validatePrincipal(obj.principal);

    this.authorizeAction.execute({
      principal,
      action: CrudAction.create,
      resource: Resource.role,
      context: { useCase: "CreateRole" },
    });

    const payload = validateCreateRolePayload(obj.payload);

    const tenantId = principal.tenantId;

    const existingTenant = await this.tenantRepository.findById(tenantId);
    if (!existingTenant) {
      throw new ResourceNotFoundError("tenant", {
        tenantId: tenantId
      })
    };

    const existingRole = await this.roleRepository.findByName({
      tenantId,
      name: payload.name,
    });

    if (existingRole) {
      throw new ConflictError(`Role '${payload.name}' already exists.`);
    }

    const date = new Date();

    const row = await this.roleRepository.create({
      id: randomUUID(),
      tenantId: tenantId,
      name: payload.name,
      createdAt: date,
      updatedAt: date,
    });

    return toRoleDto(row);
  }
}
