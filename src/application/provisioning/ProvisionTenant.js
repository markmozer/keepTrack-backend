/**
 * File: src/application/provisioning/ProvisionTenant.js
 */

// port assertions
import { assertTenantRepositoryPort } from "../ports/tenants/TenantRepositoryPort.js";

// validation
import { v } from "../../domain/shared/validation/validators.js";
import { validateProvisioningPrincipal } from "../auth/validateProvisioningPrincipal.js";
import { validateProvisionTenantPayload } from "./provisionTenant.validation.js";
import { isSingletonTenantType } from "../../domain/tenants/TenantType.js";

// domain

// mappers
import { toTenantAdminDto } from "../tenants/tenant.mappers.js";

/**
 * @typedef {Object} ProvisionTenantDto
 * @property {boolean} success
 * @property {boolean} created
 * @property {import("../ports/tenants/tenant.types.js").TenantAdminDto|null} payload
 * @property {any} error
 */

export class ProvisionTenant {
  /**
   * @param {Object} deps
   * @param {import("../ports/tenants/TenantRepositoryPort.js").TenantRepositoryPort} deps.tenantRepository
   */
  constructor({ tenantRepository }) {
    assertTenantRepositoryPort(tenantRepository);
    this.tenantRepository = tenantRepository;
  }

  /**
   * @param {import("../ports/provisioning/provisioning.types.js").ProvisionTenantUCInput} input
   * @returns {Promise<ProvisionTenantDto>}
   */
  async execute(input) {
    const obj = v.object(input, "ProvisionTenantUCInput");

    validateProvisioningPrincipal(obj.principal);
    const payload = validateProvisionTenantPayload(obj.payload);

    let existing;
    // slug must be unique
    existing = await this.tenantRepository.findBySlug(payload.slug);
    if (existing) {
      // tenant found using slug
      if (
        existing.name !== payload.name ||
        existing.type !== payload.type ||
        existing.status !== "ACTIVE"
      ) {
        // tenant details do not match
        return {
          success: false,
          created: false,
          payload: null,
          error: {
            message: `Tenant with slug ${payload.slug} exists with different details`,
            existing,
          },
        };
      } else {
        // tenant details do match
        return {
          success: true,
          created: false,
          payload: toTenantAdminDto(existing),
          error: null,
        };
      }
    }

    // If tenantType is a singleton, check if a tenant of that type already exists
    if (isSingletonTenantType(payload.type)) {
      // tenant type is a singleton
      const existing = await this.tenantRepository.findByType(payload.type);
      if (existing) {
        // a tenant of the same type exists
        return {
          success: false,
          created: false,
          payload: null,
          error: {
            message: `Only one ${payload.type} tenant is allowed. Existing ${payload.type} tenant has different details`,
            existing,
          },
        };
      }
    }

    const result = await this.tenantRepository.create({
      name: payload.name,
      slug: payload.slug,
      type: payload.type,
      createdAt: payload.now,
      updatedAt: payload.now,
    });

    return {
      success: true,
      created: true,
      payload: toTenantAdminDto(result),
      error: null,
    };
  }
}
