/**
 * File: src/application/provisioning/ProvisionBaseTenant.js
 */

import { randomUUID } from "node:crypto";

// port assertions
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertRoleRepositoryPort } from "../ports/roles/RoleRepositoryPort.js";
import { assertUserRoleRepositoryPort } from "../ports/userRoles/UserRoleRepositoryPort.js";
import { assertTokenServicePort } from "../ports/security/TokenServicePort.js";
import { assertClockServicePort } from "../ports/clock/ClockServicePort.js";
import { assertEmailServicePort } from "../ports/email/EmailServicePort.js";
import { assertTenantLinkBuilderServicePort } from "../ports/urls/TenantLinkBuilderServicePort.js";

// validation
import { v } from "../../domain/shared/validation/validators.js";
import { validateProvisioningPrincipal } from "../auth/validateProvisioningPrincipal.js";
import { validateProvisionBaseTenantPayload } from "./provisionBaseTenant.validation.js";

// errors
import { ConflictError } from "../../domain/shared/errors/index.js";

// domain
import { TenantType } from "../../domain/tenants/TenantType.js";
import { TenantStatus } from "../../domain/tenants/TenantStatus.js";
import { Role } from "../../domain/authz/authz.types.js";
import {
  UserStatus,
  isStatusForInviteUser,
} from "../../domain/users/UserStatus.js";
import { getSystemRoles } from "../../domain/authz/getSystemRoles.js";

// mappers
import { toTenantDto } from "../tenants/tenant.mappers.js";
import { toRoleAdminDto } from "../roles/role.mappers.js";
import { toUserAdminDto } from "../users/user.mappers.js";
import { toUserRoleDto } from "../userRoles/userRole.mappers.js";

// use cases
import { SeedTenantRoles } from "./SeedTenantRoles.js";

/**
 * @typedef {Object} EnsureTenantResult
 * @property {"create" | "read"} tenantAction
 * @property {import("../ports/tenants/tenant.types.js").TenantRow} provisionedTenant
 */

/**
 * @typedef {Object} EnsureRolesResult
 * @property {"ensure"} roleAction
 * @property {import("../ports/roles/role.types.js").RoleAdminRow[]} ensuredRoles
 */

/**
 * @typedef {Object} EnsureUserResult
 * @property {"create" | "read"} userAction
 * @property {import("../ports/users/user.types.js").UserAdminRow} provisionedUser
 */

/**
 * @typedef {Object} EnsureUserRoleResult
 * @property {"create" | "read"} userRoleAction
 * @property {import("../ports/userRoles/userRole.types.js").UserRoleRow} provisionedUserRole
 */

/**
 * @typedef {Object} InviteUserResult
 * @property {"create" | "update"} inviteUserAction
 * @property {import("../ports/users/user.types.js").UserAdminRow} invitedUser
 * @property {string} tokenPlaintext
 */

export class ProvisionBaseTenant {
  /**
   * @param {Object} deps
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   * @param {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} deps.userRepository
   * @param {import("../ports/roles/RoleRepositoryPort.js").RoleRepositoryPort} deps.roleRepository
   * @param {import("../ports/userRoles/UserRoleRepositoryPort.js").UserRoleRepositoryPort} deps.userRoleRepository
   * @param {import("../ports/security/TokenServicePort.js").TokenServicePort} deps.tokenService
   * @param {import("../ports/clock/ClockServicePort.js").ClockServicePort} deps.clockService
   * @param {import("../ports/urls/TenantLinkBuilderServicePort.js").TenantLinkBuilderServicePort} deps.tenantLinkBuilderService
   * @param {import("../ports/email/EmailServicePort.js").EmailServicePort} deps.emailService
   */
  constructor({
    tenantRepository,
    userRepository,
    roleRepository,
    userRoleRepository,
    tokenService,
    clockService,
    tenantLinkBuilderService,
    emailService,
  }) {
    assertTenantRepositoryPort(tenantRepository);
    assertUserRepositoryPort(userRepository);
    assertRoleRepositoryPort(roleRepository);
    assertUserRoleRepositoryPort(userRoleRepository);
    assertTokenServicePort(tokenService);
    assertClockServicePort(clockService);
    assertTenantLinkBuilderServicePort(tenantLinkBuilderService);
    assertEmailServicePort(emailService);

    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.userRoleRepository = userRoleRepository;
    this.tokenService = tokenService;
    this.clockService = clockService;
    this.tenantLinkBuilderService = tenantLinkBuilderService;
    this.emailService = emailService;

    this.seedTenantRoles = new SeedTenantRoles({
      roleRepository: this.roleRepository,
      getSystemRoles,
    });
  }

  /**
   * @param {{name: string, slug: string, now: Date}} params
   * @returns {Promise<EnsureTenantResult>}
   */
  async ensureBaseTenant({ name, slug, now }) {
    const existing = await this.tenantRepository.findByType(TenantType.BASE);

    if (existing) {
      if (existing.name !== name || existing.slug !== slug) {
        throw new ConflictError(
          "A BASE tenant already exists with other details.",
          { name: existing.name, slug: existing.slug },
        );
      }

      return {
        tenantAction: "read",
        provisionedTenant: existing,
      };
    }

    const created = await this.tenantRepository.create({
      name,
      slug,
      type: TenantType.BASE,
      createdAt: now,
      updatedAt: now,
    });

    return {
      tenantAction: "create",
      provisionedTenant: created,
    };
  }

  /**
   * @param {{tenantId: string, now: Date}} params
   * @returns {Promise<EnsureRolesResult>}
   */
  async ensureRoles({ tenantId, now }) {
    const { roles } = await this.seedTenantRoles.execute({
      tenantId,
      type: "BASE",
      createdAt: now,
      updatedAt: now,
    });

    return {
      roleAction: "ensure",
      ensuredRoles: roles,
    };
  }

  /**
   * @param {{tenantId: string, email: string, now: Date}} params
   * @returns {Promise<EnsureUserResult>}
   */
  async ensureUser({ tenantId, email, now }) {
    const existing = await this.userRepository.findByEmail({
      tenantId,
      email,
    });

    if (existing?.status === UserStatus.INACTIVE) {
      throw new ConflictError("Base tenant admin user exists but is inactive.");
    }

    if (existing) {
      return {
        userAction: "read",
        provisionedUser: existing,
      };
    }

    const created = await this.userRepository.create({
      tenantId,
      email,
      createdAt: now,
      updatedAt: now,
    });

    return {
      userAction: "create",
      provisionedUser: created,
    };
  }

  /**
   * @param {{tenantId: string, userId: string, roleId: string, now: Date}} params
   * @returns {Promise<EnsureUserRoleResult>}
   */
  async ensureUserRole({ tenantId, userId, roleId, now }) {
    const existing = await this.userRoleRepository.findByUserAndRole({
      tenantId,
      userId,
      roleId,
    });

    if (existing) {
      const isNotYetValid = existing.validFrom > now;
      const isExpired = existing.validTo !== null && existing.validTo < now;

      if (isNotYetValid || isExpired) {
        throw new ConflictError(
          "UserRole already assigned to user, but outside of validity.",
          {
            validFrom: existing.validFrom.toISOString(),
            validTo: existing.validTo ? existing.validTo.toISOString() : null,
          },
        );
      }

      return {
        userRoleAction: "read",
        provisionedUserRole: existing,
      };
    }

    const created = await this.userRoleRepository.create({
      tenantId,
      userId,
      roleId,
      validFrom: now,
      validTo: null,
      createdAt: now,
      updatedAt: now,
    });

    return {
      userRoleAction: "create",
      provisionedUserRole: created,
    };
  }

  /**
   * @param {{user: import("../ports/users/user.types.js").UserAdminRow, slug: string, now: Date}} params
   * @returns {Promise<InviteUserResult>}
   */
  async inviteUser({ user, slug, now }) {
    const inviteUserAction =
      user.status === UserStatus.NEW ? "create" : "update";

    const { tokenPlaintext, tokenHash } = this.tokenService.generate();
    const ttlDays = 14;
    const expiresAt = this.clockService.addDays(now, ttlDays);

    const updated = await this.userRepository.markAsInvited({
      userId: user.id,
      tenantId: user.tenantId,
      status: UserStatus.INVITED,
      inviteTokenHash: tokenHash,
      inviteTokenExpiresAt: expiresAt,
      updatedAt: now,
    });

    if (!(updated.inviteTokenExpiresAt instanceof Date)) {
      throw new Error("Invite token expiration not set correctly.");
    }

    const inviteLink = this.tenantLinkBuilderService.buildInviteLink({
      slug,
      token: tokenPlaintext,
    });

    await this.emailService.sendInviteUserEmail({
      to: updated.email,
      link: inviteLink,
      expiresAt: updated.inviteTokenExpiresAt,
      validityPeriod: `${ttlDays} days`,
    });

    return {
      inviteUserAction,
      invitedUser: updated,
      tokenPlaintext,
    };
  }

  /**
   * @param {import("../ports/provisioning/provisioning.types.js").ProvisionBaseTenantUCInput} input
   * @returns {Promise<import("../ports/provisioning/provisioning.types.js").ProvisionBaseTenantDto>}
   */
  async execute(input) {
    const obj = v.object(input, "ProvisionBaseTenantUCInput");

    validateProvisioningPrincipal(obj.principal);
    const payload = validateProvisionBaseTenantPayload(obj.payload);

    const now = this.clockService.now();

    const { tenantAction, provisionedTenant } = await this.ensureBaseTenant({
      name: payload.name,
      slug: payload.slug,
      now,
    });

    const { roleAction, ensuredRoles } = await this.ensureRoles({
      tenantId: provisionedTenant.id,
      now,
    });

    const superAdminRole = ensuredRoles.find(
      (role) => role.name === Role.SUPER_ADMIN,
    );

    if (!superAdminRole) {
      throw new Error("SUPER_ADMIN role not found after seeding base tenant roles.");
    }

    const { userAction, provisionedUser } = await this.ensureUser({
      tenantId: provisionedTenant.id,
      email: payload.adminEmail,
      now,
    });

    const { userRoleAction, provisionedUserRole } = await this.ensureUserRole({
      tenantId: provisionedTenant.id,
      userId: provisionedUser.id,
      roleId: superAdminRole.id,
      now,
    });

    let inviteUserAction = "not sent";
    let invitedUser = provisionedUser;
    let tokenPlaintext = "no token generated";

    if (isStatusForInviteUser(provisionedUser.status)) {
      ({
        inviteUserAction,
        invitedUser,
        tokenPlaintext,
      } = await this.inviteUser({
        user: provisionedUser,
        slug: payload.slug,
        now,
      }));
    }

    return {
      tenantAction,
      provisionedTenant: toTenantDto(provisionedTenant),
      roleAction,
      provisionedRoles: ensuredRoles.map(toRoleAdminDto),
      userAction,
      provisionedUser: toUserAdminDto(provisionedUser),
      userRoleAction,
      provisionedUserRole: toUserRoleDto(provisionedUserRole),
      inviteUserAction,
      invitedUser: toUserAdminDto(invitedUser),
      tokenPlaintext,
    };
  }
}