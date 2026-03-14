/**
 * File: src/application/tenants/CreateTenant.js
 */
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { validateCreateTenantInput } from "./createTenant.validation.js";
import { randomUUID } from "node:crypto";

import { ConflictError } from "../../domain/shared/errors/index.js";
import { TenantStatus } from "../../domain/tenants/TenantStatus.js";
import { toTenantDto } from "./tenant.mappers.js";

/**
 * @typedef {import("../ports/tenants/tenant.types.js").CreateTenantUseCaseInput} CreateTenantUseCaseInput
 * @typedef {import("../ports/tenants/tenant.types.js").TenantDto} TenantDto
 * @typedef {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 */

export class CreateTenant {
  /**
   * @param {{ tenantRepository: TenantRepositoryPort }} deps
   */
  constructor({ tenantRepository }) {
    assertTenantRepositoryPort(tenantRepository);
    this.tenantRepository = tenantRepository;
  }

  /**
   * @param {CreateTenantUseCaseInput} input
   * @returns {Promise<TenantDto>}
   */
  async execute(input) {

    const validated = validateCreateTenantInput({
        name: input?.name,
        slug: input?.slug,
    })
 
    const existing = await this.tenantRepository.findBySlug(validated.slug);
    if (existing) {
      throw new ConflictError(`Tenant slug '${validated.slug}' already exists.`);
    }
    
    const date = new Date();

    const row = await this.tenantRepository.create({
      id: randomUUID(),
      name: validated.name,
      slug: validated.slug,
      status: TenantStatus.ACTIVE,
      createdAt: date,
      updatedAt: date,
    });

    return toTenantDto(row);
  }
}