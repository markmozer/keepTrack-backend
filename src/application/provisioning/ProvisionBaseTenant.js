/**
 * File: src/application/provisioning/ProvisionBaseTenant.js
 */

// imports for port assertion
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";
import { assertUserRepositoryPort } from "../ports/users/UserRepositoryPort.js";
import { assertRoleRepositoryPort } from "../ports/roles/RoleRepositoryPort.js";
import { assertUserRoleRepositoryPort } from "../ports/userRoles/UserRoleRepositoryPort.js";
import { assertTokenServicePort } from "../ports/security/TokenServicePort.js";
import { assertClockServicePort } from "../ports/clock/ClockServicePort.js";
import { assertEmailServicePort } from "../ports/email/EmailServicePort.js";
import { assertInviteLinkBuilderPort } from "../ports/urls/InviteLinkBuilderPort.js";

// imports for validation
import { v } from "../../domain/shared/validation/validators.js";
import { validateProvisioningPrincipal } from "../auth/validateProvisioningPrincipal.js";
import { validateProvisionBaseTenantPayload } from "./provisionBaseTenant.validation.js";

// error imports
import {
  ConflictError,
  ValidationError,
} from "../../domain/shared/errors/index.js";

// other domain imports
import { TenantType } from "../../domain/tenants/TenantType.js";
import { TenantStatus } from "../../domain/tenants/TenantStatus.js";
import { Role } from "../../domain/authz/authz.types.js";
import {
  UserStatus,
  isStatusForInviteUser,
} from "../../domain/users/UserStatus.js";

// mapper imports
import { toTenantDto } from "../tenants/tenant.mappers.js";
import { toRoleDto } from "../roles/role.mappers.js";
import { toUserDtoPublic } from "../users/user.mappers.js";
import { toUserRoleDto } from "../userRoles/userRole.mappers.js";

// other imports
import { randomUUID } from "node:crypto";

/**
 * @typedef {import("../ports/provisioning/provisioning.types.js").ProvisionBaseTenantUCInput} ProvisionBaseTenantUCInput
 * @typedef {import("../ports/provisioning/provisioning.types.js").ProvisionBaseTenantDto} ProvisionBaseTenantDto
 * @typedef {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} TenantRepositoryPort
 * @typedef {import("../ports/users/UserRepositoryPort.js").UserRepositoryPort} UserRepositoryPort
 * @typedef {import("../ports/roles/RoleRepositoryPort.js").RoleRepositoryPort} RoleRepositoryPort
 * @typedef {import("../ports/userRoles/UserRoleRepositoryPort.js").UserRoleRepositoryPort} UserRoleRepositoryPort
 * @typedef {import("../ports/security/TokenServicePort.js").TokenServicePort} TokenServicePort
 * @typedef {import("../ports/clock/ClockServicePort.js").ClockServicePort} ClockServicePort
 * @typedef {import("../ports/urls/InviteLinkBuilderPort.js").InviteLinkBuilderPort} InviteLinkBuilderPort
 * @typedef {import("../ports/email/EmailServicePort.js").EmailServicePort} EmailServicePort
 *
 */

/**
 * @typedef {import("../ports/tenants/tenant.types.js").TenantRow} TenantRow
 * @typedef {import("../ports/roles/role.types.js").RoleRow} RoleRow
 * @typedef {import("../ports/users/user.types.js").UserRowPublic} UserRowPublic
 * @typedef {import("../ports/userRoles/userRole.types.js").UserRoleRow} UserRoleRow
 */

/**
 * @typedef {Object} EnsureTenantResult
 * @property {"create" | "read"} tenantAction
 * @property {TenantRow} provisionedTenant
 */

/**
 * @typedef {Object} EnsureSuperAdminRoleResult
 * @property {"create" | "read"} roleAction
 * @property {RoleRow} provisionedRole
 */

/**
 * @typedef {Object} EnsureUserResult
 * @property {"create" | "read"} userAction
 * @property {UserRowPublic} provisionedUser
 */

/**
 * @typedef {Object} EnsureUserRoleResult
 * @property {"create" | "read"} userRoleAction
 * @property {UserRoleRow} provisionedUserRole
 */

/**
 * @typedef {Object} IssueInviteResult
 * @property {"create" | "update"} inviteUserAction
 * @property {UserRowPublic} invitedUser
 * @property {string} tokenPlaintext
 */

export class ProvisionBaseTenant {
  /**
   * @param {{
   * tenantRepository: TenantRepositoryPort,
   * userRepository: UserRepositoryPort,
   * roleRepository: RoleRepositoryPort,
   * userRoleRepository: UserRoleRepositoryPort,
   * tokenService: TokenServicePort,
   * clockService: ClockServicePort,
   * inviteLinkBuilder: InviteLinkBuilderPort,
   * emailService: EmailServicePort,}} deps
   */
  constructor({
    tenantRepository,
    userRepository,
    roleRepository,
    userRoleRepository,
    tokenService,
    clockService,
    inviteLinkBuilder,
    emailService,
  }) {
    assertTenantRepositoryPort(tenantRepository);
    assertUserRepositoryPort(userRepository);
    assertRoleRepositoryPort(roleRepository);
    assertUserRoleRepositoryPort(userRoleRepository);
    assertTokenServicePort(tokenService);
    assertClockServicePort(clockService);
    assertInviteLinkBuilderPort(inviteLinkBuilder);
    assertEmailServicePort(emailService);
    this.tenantRepository = tenantRepository;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.userRoleRepository = userRoleRepository;
    this.tokenService = tokenService;
    this.clockService = clockService;
    this.inviteLinkBuilder = inviteLinkBuilder;
    this.emailService = emailService;
  }

  /**
   * @param {{name: string, slug: string, now: Date}} params
   * @returns{Promise<EnsureTenantResult>}
   */
  async ensureBaseTenant({ name, slug, now }) {
    const existing = await this.tenantRepository.findByType(TenantType.BASE);

    if (existing) {
      if (existing.name !== name || existing.slug !== slug) {
        throw new ConflictError(
          "A BASE tenant already exists with other details",
          { name: existing.name, slug: existing.slug },
        );
      }

      return {
        tenantAction: "read",
        provisionedTenant: existing,
      };
    }

    const created = await this.tenantRepository.create({
      id: randomUUID(),
      name,
      slug,
      type: TenantType.BASE,
      status: TenantStatus.ACTIVE,
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
   * @returns{Promise<EnsureSuperAdminRoleResult>}
   */
  async ensureSuperAdminRole({ tenantId, now }) {
    const existing = await this.roleRepository.findByName({
      tenantId,
      name: Role.SUPER_ADMIN,
    });

    if (existing) {
      return {
        roleAction: "read",
        provisionedRole: existing,
      };
    }
    const created = await this.roleRepository.create({
      id: randomUUID(),
      tenantId,
      name: Role.SUPER_ADMIN,
      createdAt: now,
      updatedAt: now,
    });

    return {
      roleAction: "create",
      provisionedRole: created,
    };
  }

  /**
   * @param {{tenantId: string, email: string, now: Date}} params
   * @returns{Promise<EnsureUserResult>}
   */
  async ensureUser({ tenantId, email, now }) {
    const existing = await this.userRepository.findByEmail({
      tenantId,
      email,
    });

    if (existing && existing.status === UserStatus.INACTIVE) {
      throw new ConflictError("Base tenant admin user exists but is inactive.");
    }

    if (existing && existing.status === UserStatus.ACTIVE) {
      throw new ConflictError(
        "Base tenant admin user exists and is already active.",
      );
    }

    if (existing) {
      return {
        userAction: "read",
        provisionedUser: existing,
      };
    }

    const created = await this.userRepository.create({
      id: randomUUID(),
      tenantId,
      email,
      status: UserStatus.NEW,
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
   * @returns{Promise<EnsureUserRoleResult>}
   */
  async ensureUserRole({ tenantId, userId, roleId, now }) {
    const existing = await this.userRoleRepository.findByUserAndRole({
      tenantId,
      userId,
      roleId,
    });

    if (existing) {
      if (
        existing.validFrom >= now ||
        (existing.validTo !== null && existing.validTo < now)
      ) {
        throw new ConflictError(
          "UserRole already assigned to user, but outside of validity",
          {
            validFrom: existing.validFrom.toISOString(),
            validTo: existing.validTo ? existing.validTo.toISOString() : null,
          },
        );
      }
    }

    if (existing) {
      return {
        userRoleAction: "read",
        provisionedUserRole: existing,
      };
    }

    const created = await this.userRoleRepository.create({
      id: randomUUID(),
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
   * @param {{user: UserRowPublic, slug: string, now: Date}} params
   * @returns{Promise<IssueInviteResult>}
   */
  async issueInviteUser({ user, slug, now }) {
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

    // make sure that expiresAt is a valid date
    const returnedExpiresAt = updated.inviteTokenExpiresAt;
    if (!(returnedExpiresAt instanceof Date)) {
      throw new Error("Invite token expiration not set correctly");
    }

    const inviteLink = this.inviteLinkBuilder.buildInviteLink({
      slug,
      token: tokenPlaintext,
    });

    await this.emailService.sendInviteUserEmail({
      to: updated.email,
      link: inviteLink,
      expiresAt: returnedExpiresAt,
    });

    return {
      inviteUserAction,
      invitedUser: updated,
      tokenPlaintext,
    };
  }

  /**
   * @param {ProvisionBaseTenantUCInput} input
   * @returns {Promise<ProvisionBaseTenantDto>}
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

    const { roleAction, provisionedRole } = await this.ensureSuperAdminRole({
      tenantId: provisionedTenant.id,
      now,
    });

    const { userAction, provisionedUser } = await this.ensureUser({
      tenantId: provisionedTenant.id,
      email: payload.adminEmail,
      now,
    });

    const { userRoleAction, provisionedUserRole } = await this.ensureUserRole({
      tenantId: provisionedTenant.id,
      userId: provisionedUser.id,
      roleId: provisionedRole.id,
      now,
    });

    if (!isStatusForInviteUser(provisionedUser.status)) {
      throw new ValidationError("user status must be NEW or INVITED", {
        status: provisionedUser.status,
      });
    }

    const { inviteUserAction, invitedUser, tokenPlaintext } =
      await this.issueInviteUser({
        user: provisionedUser,
        slug: payload.slug,
        now,
      });

    return {
      tenantAction,
      provisionedTenant: toTenantDto(provisionedTenant),
      roleAction,
      provisionedRole: toRoleDto(provisionedRole),
      userAction,
      provisionedUser: toUserDtoPublic(provisionedUser),
      userRoleAction,
      provisionedUserRole: toUserRoleDto(provisionedUserRole),
      inviteUserAction,
      invitedUser: toUserDtoPublic(invitedUser),
      tokenPlaintext,
    };
  }
}
