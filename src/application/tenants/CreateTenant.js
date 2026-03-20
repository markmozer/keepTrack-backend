/**
 * File: src/application/tenants/CreateTenant.js
 */
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { validateCreateTenantPayload } from "./createTenant.validation.js";

import { ConflictError } from "../../domain/shared/errors/index.js";

import { TenantStatus } from "../../domain/tenants/TenantStatus.js";
import { CrudAction } from "../../domain/authz/authz.types.js";
import { Resource } from "../../domain/authz/authz.types.js";

import { randomUUID } from "node:crypto";
import { toTenantDto } from "./tenant.mappers.js";

/**
 * @typedef {import("../ports/tenants/tenant.types.js").CreateTenantUCInput} CreateTenantUCInput
 * @typedef {import("../ports/tenants/tenant.types.js").TenantDto} TenantDto
 * @typedef {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 * @typedef {import("../authz/AuthorizeAction.js").AuthorizeAction} AuthorizeAction
 */

export class CreateTenant {
  /**
   * @param {{ tenantRepository: TenantRepositoryPort, authorizeAction: AuthorizeAction}} deps
   */
  constructor({ tenantRepository, authorizeAction }) {
    assertTenantRepositoryPort(tenantRepository);
    this.tenantRepository = tenantRepository;
    this.authorizeAction = authorizeAction;
  }

  /**
   * @param {CreateTenantUCInput} input
   * @returns {Promise<TenantDto>}
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
      throw new ConflictError(
        `Tenant slug '${payload.slug}' already exists.`,
      );
    }

    const date = new Date();

    const row = await this.tenantRepository.create({
      id: randomUUID(),
      name: payload.name,
      slug: payload.slug,
      status: TenantStatus.ACTIVE,
      createdAt: date,
      updatedAt: date,
    });

    return toTenantDto(row);
  }
}
