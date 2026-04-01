/**
 * File: src/application/tenants/GetTenantById.js
 */
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { validateGetTenantByIdPayload } from "./getTenantById.validation.js";

import { ResourceNotFoundError } from "../../domain/shared/errors/index.js";

import { CrudAction } from "../../domain/authz/authz.types.js";
import { Resource } from "../../domain/authz/authz.types.js";

import { toTenantAdminDto } from "./tenant.mappers.js";


export class GetTenantById {
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
   * @param {import("../ports/tenants/tenant.types.js").GetTenantByIdUCInput} input
   * @returns {Promise<import("../ports/tenants/tenant.types.js").TenantDto>}
   */
  async execute(input) {
    const obj = v.object(input, "GetTenantById input");

    const principal = validatePrincipal(obj.principal); 

    const targetTenantIdforAuthz = input.payload.targetTenantId ? /**@type {string} */(input.payload.targetTenantId) : undefined;

    this.authorizeAction.execute({
      principal,
      action: CrudAction.read,
      resource: Resource.tenant,
      context: { useCase: "GetTenantById", ownerId: targetTenantIdforAuthz },
    });

    const payload = validateGetTenantByIdPayload(obj.payload);


    const tenantId = principal.tenantId;
    const targetTenantId = payload.targetTenantId;

    const tenantRow = await this.tenantRepository.findById(targetTenantId);
    if (!tenantRow) {
      throw new ResourceNotFoundError("tenant", { tenantId: tenantId });
    }

    return toTenantAdminDto(tenantRow);
  }
}
