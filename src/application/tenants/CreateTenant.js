/**
 * File: keepTrack-backend/src/application/tenants/CreateTenant.js
 */
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { validateCreateTenantInput } from "./createTenant.validation.js";
import { randomUUID } from "node:crypto";

import { ConflictError } from "../../domain/shared/errors/index.js";
import { toTenantDto } from "./tenant.mappers.js";

/**
 * @typedef {import("../ports/tenants/tenant.types.js").TenantDto} TenantDto
 * @typedef {import("../ports/tenants/tenant.types.js").TenantRow} TenantRow
 * @typedef {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 */

/**
 * @typedef {Object} CreateTenantInput
 * @property {unknown} name
 * @property {unknown} slug
 * @property {unknown} status
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
   * @param {CreateTenantInput} input
   * @returns {Promise<TenantDto>}
   */
  async execute(input) {

    const validated = validateCreateTenantInput({
        name: input?.name,
        slug: input?.slug,
        status: input?.status,
    })
 
    const existing = await this.tenantRepository.findBySlug(validated.slug);
    if (existing) {
      throw new ConflictError(`Tenant slug '${validated.slug}' already exists.`);
    }

    const row = await this.tenantRepository.create({
      id: randomUUID(),
      name: validated.name,
      slug: validated.slug,
      status: validated.status,
    });

    return toTenantDto(row);
  }
}