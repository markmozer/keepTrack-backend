/**
 * File: src/application/provisioning/seedTenantRoles.js
 */


import { assertRoleRepositoryPort } from "../ports/roles/RoleRepositoryPort.js";
import { v } from "../../domain/shared/validation/validators.js";

/**
 * @typedef {Object} SeedTenantRolesInput
 * @property {string} tenantId
 * @property {"BASE" | "TENANT"} type
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

export class SeedTenantRoles {
  /**
   * @param {Object} deps
   * @param {import("../../domain/authz/getSystemRoles").getSystemRoles} deps.getSystemRoles
   * @param {import("../ports/roles/RoleRepositoryPort.js").RoleRepositoryPort} deps.roleRepository
   */
  constructor({ roleRepository, getSystemRoles }) {
    assertRoleRepositoryPort(roleRepository);
    this.roleRepository = roleRepository;
    this.getSystemRoles = getSystemRoles;
  }

  /**
   * @param {SeedTenantRolesInput} input
   */
  async execute(input) {
    const { tenantId, type, createdAt, updatedAt } = input;

    v.date(createdAt, "createdAt", {nullable: true});
    v.date(updatedAt, "updatedAt", {nullable: true});

    const roles = this.getSystemRoles(type);

    const ensuredRoles = [];

    for (const role of roles) {
      const result = await this.roleRepository.ensure({
        tenantId,
        name: role.name,
        createdAt,
        updatedAt,
      });

      ensuredRoles.push(result);
    }

    return {
      count: ensuredRoles.length,
      roles: ensuredRoles,
    };
  }
}
