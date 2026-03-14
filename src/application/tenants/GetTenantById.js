/**
 * File: src/application/tenants/GetTenantById.js
 */

import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { v } from "../../domain/shared/validation/validators.js";

import { ResourceNotFoundError } from "../../domain/shared/errors/index.js";
import { toTenantDto } from "./tenant.mappers.js";

/**
 * @typedef {import("../ports/tenants/tenant.types.js").TenantDto} TenantDto
 * @typedef {import("../ports/tenants/tenant.types.js").TenantRow} TenantRow
 * @typedef {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 */

/**
 * @typedef {Object} GetTenantByIdInput
 * @property {unknown} tenantId
 */

export class GetTenantById {
  /**
   * @param {{ tenantRepository: TenantRepositoryPort }} deps
   */
  constructor({ tenantRepository }) {
    assertTenantRepositoryPort(tenantRepository);
    this.tenantRepository = tenantRepository;
  }

  /**
   * @param {GetTenantByIdInput} input
   * @returns {Promise<TenantDto>}
   */
  async execute(input) {

    const tenantId = v.uuid(input?.tenantId, "tenantId");

    const tenantRow = await this.tenantRepository.findById(tenantId);
    if (!tenantRow) {
      throw new ResourceNotFoundError("tenant", {tenantId: tenantId});
    }

    return toTenantDto(tenantRow);
  }
}