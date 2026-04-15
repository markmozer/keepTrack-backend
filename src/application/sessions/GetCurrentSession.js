/**
 * File: src/application/sessions/GetCurrentSession.js
 */


import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";


import { v } from "../../domain/shared/validation/validators.js";
import { validatePrincipal } from "../auth/validatePrincipal.js";
import { validateGetCurrentSessionPayload } from "./getCurrentSession.validation.js";

import {
  ResourceNotFoundError,
} from "../../domain/shared/errors/index.js";

import { CrudAction } from "../../domain/authz/authz.types.js";
import { Resource } from "../../domain/authz/authz.types.js";

import { toSessionTenantDto, toSessionUserDto } from "./session.mappers.js";

export class GetCurrentSession {
  /**
   * @param {Object} deps
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   * @param {import("../authz/AuthorizeAction.js").AuthorizeAction} deps.authorizeAction
   */
  constructor({
    tenantRepository,
    userRepository,
    authorizeAction,
  }) {
    assertTenantRepositoryPort(tenantRepository);
    assertUserRepositoryPort(userRepository);
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.authorizeAction = authorizeAction;
  }

  /**
   *
   * @param {import("../ports/session/session.types.js").GetCurrentSessionUCInput} input
   * @returns {Promise<import("../ports/session/session.types.js").CurrentSessionDto>}
   */
  async execute(input) {
    const obj = v.object(input, "GetCurrentSession input");

    const principal = validatePrincipal(obj.principal);

    this.authorizeAction.execute({
      principal,
      action: CrudAction.read,
      resource: Resource.session,
      context: { 
        useCase: "GetCurrentSession",
        ownerId: principal.userId,
        tenantId: principal.tenantId,
      },
    });

    const payload = validateGetCurrentSessionPayload(obj.payload);

    const tenant = await this.tenantRepository.findById(payload.tenantId);
    if (!tenant) {
      throw new ResourceNotFoundError("tenant", {
        tenantId: payload.tenantId,
      });
    }

    const user = await this.userRepository.findById({
      tenantId: tenant.id,
      userId: payload.userId,
    });

    if (!user) {
      throw new ResourceNotFoundError("user", { userId: payload.userId });
    }
    return {
        principal,
        user: toSessionUserDto(user),
        tenant: toSessionTenantDto(tenant),
      };
  }
}
