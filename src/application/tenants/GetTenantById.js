/**
 * File: src/application/tenants/GetTenantById.js
 */

import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { v } from "../../domain/shared/validation/validators.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { validateGetTenantByIdPayload } from "./getTenantById.validation.js";

import { ResourceNotFoundError } from "../../domain/shared/errors/index.js";
import { toTenantDto } from "./tenant.mappers.js";

/**
 * @typedef {import("../ports/tenants/tenant.types.js").GetTenantByIdUCInput} GetTenantByIdUCInput
 * @typedef {import("../ports/tenants/tenant.types.js").TenantDto} TenantDto
 * @typedef {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
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
   * @param {GetTenantByIdUCInput} input
   * @returns {Promise<TenantDto>}
   */
  async execute(input) {
    const obj = v.object(input, "GetTenantById input");

    const principal = validatePrincipal(obj.principal);
    const payload = validateGetTenantByIdPayload(obj.payload);

    const tenantId = principal.tenantId;
    const targetTtenantId = payload.targetTenantId;

    const tenantRow = await this.tenantRepository.findById(targetTtenantId);
    if (!tenantRow) {
      throw new ResourceNotFoundError("tenant", { tenantId: tenantId });
    }

    return toTenantDto(tenantRow);
  }
}
