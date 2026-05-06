/**
 * File: keepTrack-backend/src/application/users/GetUserById.js
 */
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertClockServicePort } from "../ports/clock/ClockServicePort.js";

import { v } from "../../domain/shared/validation/validators.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { validateGetUserByIdPayload } from "./getUserById.validation.js";

import { ResourceNotFoundError } from "../../domain/shared/errors/index.js";

import { CrudAction } from "../../domain/authz/authz.types.js";
import { Resource } from "../../domain/authz/authz.types.js";
import { combinePossibleActionsWithAbilities } from "../authz/actions/combinePossibleActionsWithPolicy.js";
import { mapPrincipalToAbilities } from "../authz/mapPrincipalToAbilities.js";
import { userActionPolicy } from "../authz/actions/UserActionPolicy.js";
import { userRoleActionPolicy } from "../authz/actions/UserRoleActionPolicy.js";

import { toPublicUserDto } from "./user.mappers.js";

export class GetUserById {
  /**
   * @param {Object} deps
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   * @param {import("../ports/clock/ClockServicePort.js").ClockServicePort} deps.clockService
   * @param {import("../authz/AuthorizeAction.js").AuthorizeAction} deps.authorizeAction
   *
   */
  constructor({
    tenantRepository,
    userRepository,
    clockService,
    authorizeAction,
  }) {
    assertTenantRepositoryPort(tenantRepository);
    assertUserRepositoryPort(userRepository);
    assertClockServicePort(clockService);
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.clockService = clockService;
    this.authorizeAction = authorizeAction;
  }

  /**
   *
   * @param {import("../ports/users/user.types.js").GetUserByIdUCInput} input
   * @returns {Promise<import("../ports/users/user.types.js").PublicUserDto>}
   */
  async execute(input) {
    const obj = v.object(input, "InviteUser input");

    const principal = validatePrincipal(obj.principal);

    this.authorizeAction.execute({
      principal,
      action: CrudAction.read,
      resource: Resource.user,
      context: { useCase: "GetUserById" },
    });

    const payload = validateGetUserByIdPayload(obj.payload);

    const tenantId = principal.tenantId;

    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new ResourceNotFoundError("tenant", {
        tenantId,
      });
    }

    const user = await this.userRepository.findById({
      tenantId,
      userId: payload.userId,
    });

    if (!user) {
      throw new ResourceNotFoundError("user", { userId: payload.userId });
    }

    const now = this.clockService.now();

    const userPossibleActions = user.getPossibleActions(now);
    const userRolePossibleActionsById =
      user.getUserRolePossibleActionsById(now);
    const principalAbilities = mapPrincipalToAbilities(principal);

    const availableActions = combinePossibleActionsWithAbilities({
      possibleActions: userPossibleActions,
      principalAbilities,
      actionAbilityMap: userActionPolicy,
    });

    /** @type {Record<string, import("../ports/users/user.types.js").UserRoleAvailableActionsDto>} */
    const userRoleAvailableActionsById = {};

    for (const [userRoleId, rolePossibleActions] of Object.entries(
      userRolePossibleActionsById,
    )) {
      userRoleAvailableActionsById[userRoleId] =
        combinePossibleActionsWithAbilities({
          possibleActions: rolePossibleActions,
          principalAbilities,
          actionAbilityMap: userRoleActionPolicy,
        });
    }

    return toPublicUserDto(user, { availableActions, userRoleAvailableActionsById });
  }
}
