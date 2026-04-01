/**
 * File: src/application/roles/GetRoles.js
 */
import { assertRoleRepositoryPort } from "../ports/roles/RoleRepositoryPort.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { normalizePagination } from "../shared/pagination/normalizePagination.js";
import { createPagedResult } from "../shared/pagination/createPagedResult.js";
import { normalizeGetRolesFilters } from "./normalizeGetRolesFilters.js";
import { normalizeGetRolesSort } from "./normalizeGetRolesSort.js";
import { toRoleDto } from "./role.mappers.js";

export class GetRoles {
  /**
   * @param {Object} deps
   * @param {import("../ports/roles/RoleRepositoryPort.js").RoleRepositoryPort} deps.roleRepository
   * @param {import("../authz/AuthorizeAction.js").AuthorizeAction} deps.authorizeAction
   */
  constructor({ roleRepository, authorizeAction }) {
    assertRoleRepositoryPort(roleRepository);
    this.roleRepository = roleRepository;
    this.authorizeAction = authorizeAction;
  }

  /**
   * @param {import("../ports/roles/role.types.js").GetRolesUCInput} input
   * @returns {Promise<import("../ports/roles/role.types.js").GetRolesUCOutput>}
   */
  async execute(input) {
    const principal = validatePrincipal(input?.principal);

    this.authorizeAction.execute({
      principal,
      action: "list",
      resource: "role",
      context: { useCase: "GetRoles" },
    });

    const payload = input?.payload ?? {};
    const pagination = normalizePagination(payload.pagination);
    const filters = normalizeGetRolesFilters(payload.filters);
    const sort = normalizeGetRolesSort(payload.sort);

    const result = await this.roleRepository.findPage({
      tenantId: principal.tenantId,
      skip: pagination.skip,
      take: pagination.take,
      filters,
      sort,
    });

    return createPagedResult({
      items: result.items.map(toRoleDto),
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems: result.totalItems,
    });
  }
}
