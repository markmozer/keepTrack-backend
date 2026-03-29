/**
 * File: src/application/users/GetUsers.js
 */
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { normalizePagination } from "../shared/pagination/normalizePagination.js";
import { createPagedResult } from "../shared/pagination/createPagedResult.js";
import { normalizeGetUsersFilters } from "./normalizeGetUsersFilters.js";
import { normalizeGetUsersSort } from "./normalizeGetUsersSort.js";
import { toUserDto } from "./user.mappers.js";

export class GetUsers {
  /**
   * @param {Object} deps
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   * @param {import("../authz/AuthorizeAction.js").AuthorizeAction} deps.authorizeAction
   */
  constructor({ userRepository, authorizeAction }) {
    assertUserRepositoryPort(userRepository);
    this.userRepository = userRepository;
    this.authorizeAction = authorizeAction;
  }

  /**
   * @param {import("../ports/users/user.types.js").GetUsersUCInput} input
   * @returns {Promise<import("../ports/users/user.types.js").GetUsersUCOutput>}
   */
  async execute(input) {
    const principal = validatePrincipal(input?.principal);

    this.authorizeAction.execute({
      principal,
      action: "list",
      resource: "user",
      context: { useCase: "GetUsers" },
    });

    const payload = input?.payload ?? {};
    const pagination = normalizePagination(payload.pagination);
    const filters = normalizeGetUsersFilters(payload.filters);
    const sort = normalizeGetUsersSort(payload.sort);

    const result = await this.userRepository.findPage({
      tenantId: principal.tenantId,
      skip: pagination.skip,
      take: pagination.take,
      filters,
      sort,
    });

    return createPagedResult({
      items: result.items.map(toUserDto),
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems: result.totalItems,
    });
  }
}
