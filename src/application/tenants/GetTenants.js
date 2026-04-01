/**
 * File: src/application/tenants/GetTenants.js
 */
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { normalizePagination } from "../shared/pagination/normalizePagination.js";
import { createPagedResult } from "../shared/pagination/createPagedResult.js";
import { normalizeGetTenantsFilters } from "./normalizeGetTenantsFilters.js";
import { normalizeGetTenantsSort } from "./normalizeGetTenantsSort.js";
import { toTenantDto } from "./tenant.mappers.js";

export class GetTenants {
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
   * @param {import("../ports/tenants/tenant.types.js").GetTenantsUCInput} input
   * @returns {Promise<import("../ports/tenants/tenant.types.js").GetTenantsUCOutput>}
   */
  async execute(input) {
    const principal = validatePrincipal(input?.principal);

    this.authorizeAction.execute({
      principal,
      action: "list",
      resource: "tenant",
      context: { useCase: "GetTenants" },
    });

    const payload = input?.payload ?? {};
    const pagination = normalizePagination(payload.pagination);
    const filters = normalizeGetTenantsFilters(payload.filters);
    const sort = normalizeGetTenantsSort(payload.sort);

    const result = await this.tenantRepository.findPage({
      skip: pagination.skip,
      take: pagination.take,
      filters,
      sort,
    });

    return createPagedResult({
      items: result.items.map(toTenantDto),
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems: result.totalItems,
    });
  }
}
