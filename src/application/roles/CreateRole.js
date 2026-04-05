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

import { toRoleDto } from "./role.mappers.js";


export class CreateRole {
  /**
   * @param {Object} deps
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   * @param {import("../ports/roles/RoleRepositoryPort.js").RoleRepositoryPort} deps.roleRepository
   * @param {import("../authz/AuthorizeAction.js").AuthorizeAction} deps.authorizeAction
   */
  constructor({ tenantRepository, roleRepository, authorizeAction }) {
    assertTenantRepositoryPort(tenantRepository);
    assertRoleRepositoryPort(roleRepository);
    this.tenantRepository = tenantRepository;
    this.roleRepository = roleRepository;
    this.authorizeAction = authorizeAction;
  }

  /**
   * @param {import("../ports/roles/role.types.js").CreateRoleUCInput} input
   * @returns {Promise<import("../ports/roles/role.types.js").RoleDto>}
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

    const row = await this.roleRepository.create({
      tenantId: tenantId,
      name: payload.name,
    });

    return toRoleDto(row);
  }
}
