/**
 * File: src/application/provisioning/ProvisionTenantAdminUser.js
 */

// port assertions
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";

// validation
import { v } from "../../domain/shared/validation/validators.js";
import { validateProvisioningPrincipal } from "../auth/validateProvisioningPrincipal.js";
import { validateProvisionTenantAdminUserPayload } from "./provisionTenantAdminUser.validation.js";

// domain
import { User } from "../../domain/users/User.js";
import { UserStatus } from "../../domain/users/UserStatus.js";

// mappers
import { toUserDetailDto, toPublicUserDto } from "../users/user.mappers.js";

// other
import { ConflictError } from "../../domain/shared/errors/index.js";

/**
 * @typedef {Object} ProvisionedAdminUserDto
 * @property {boolean} success
 * @property {boolean} created
 * @property {import("../ports/users/user.types.js").UserDetailDto | null} payload
 * @property {any} error
 */

export class ProvisionTenantAdminUser {
  /**
   * @param {Object} deps
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   */
  constructor({ tenantRepository, userRepository }) {
    assertTenantRepositoryPort(tenantRepository);
    assertUserRepositoryPort(userRepository);
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
  }

  /**
   * @param {import("../ports/provisioning/provisioning.types.js").ProvisionTenantAdminUserUCInput} input
   * @returns {Promise<ProvisionedAdminUserDto>}
   */
  async execute(input) {
    const obj = v.object(input, "ProvisionTenantAdminUserUCInput");

    validateProvisioningPrincipal(obj.principal);
    const payload = validateProvisionTenantAdminUserPayload(obj.payload);

    const tenant = await this.tenantRepository.findById(payload.tenantId);

    if (!tenant) {
      return {
        success: false,
        created: false,
        payload: null,
        error: `tenant with id ${payload.tenantId} does not exist`,
      };
    }

    const existingUser = await this.userRepository.findByEmail({
      tenantId: tenant.id,
      email: payload.email,
    });

    if (existingUser?.status === UserStatus.INACTIVE) {
      throw new ConflictError(
        `tenant admin user with email ${payload.email} exists but is inactive.`,
      );
    }

    if (existingUser) {
      return {
        success: true,
        created: false,
        payload: toUserDetailDto(existingUser),
        error: null,
      };
    }

    const user = User.createNew({tenantId: tenant.id, email: payload.email, now: payload.now});

    const persistedUser = await this.userRepository.create(user);

    return {
      success: true,
      created: true,
      payload: toPublicUserDto(persistedUser),
      error: null,
    };
  }
}
