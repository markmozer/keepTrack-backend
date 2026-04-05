/**
 * File: src/application/tenants/CreateTenant.js
 */
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { validateCreateTenantPayload } from "./createTenant.validation.js";

import { ConflictError } from "../../domain/shared/errors/index.js";

import { TenantStatus } from "../../domain/tenants/TenantStatus.js";
import { tenantTypeRules } from "../../domain/tenants/TenantType.js";
import { CrudAction } from "../../domain/authz/authz.types.js";
import { Resource } from "../../domain/authz/authz.types.js";

import { toTenantAdminDto } from "./tenant.mappers.js";

export class CreateTenant {
  /**
   * @param {Object} deps
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   * @param {import("../authz/AuthorizeAction.js").AuthorizeAction} deps.authorizeAction
   */
  constructor({ tenantRepository, authorizeAction }) {
    assertTenantRepositoryPort(tenantRepository);
    this.tenantRepository = tenantRepository;
    this.authorizeAction = authorizeAction;
  }

  /**
   * @param {import("../ports/tenants/tenant.types.js").CreateTenantUCInput} input
   * @returns {Promise<import("../ports/tenants/tenant.types.js").TenantDto>}
   */
  async execute(input) {
    const obj = v.object(input, "CreateTenant input");

    const principal = validatePrincipal(obj.principal);

    this.authorizeAction.execute({
      principal,
      action: CrudAction.create,
      resource: Resource.tenant,
      context: { useCase: "CreateTenant" },
    });

    const payload = validateCreateTenantPayload(obj.payload);

    const existing = await this.tenantRepository.findBySlug(payload.slug);
    if (existing) {
      throw new ConflictError(`Tenant slug '${payload.slug}' already exists.`);
    }

    if (tenantTypeRules[payload.type].maxCount === 1) {
      const existing = await this.tenantRepository.findByType(payload.type);
      if (existing) {
        throw new ConflictError(`A tenant of type ${payload.type} already exists.`);
      }
    }

    const row = await this.tenantRepository.create({
      name: payload.name,
      slug: payload.slug,
      type: payload.type,
    });

    return toTenantAdminDto(row);
  }
}
