/**
 * File: src/domain/authz/systemRoleDefinitions.js
 */

/**
 * @typedef {"BASE_ONLY" | "TENANT"} RoleScope
 */

/**
 * @typedef {Object} SystemRoleDefinition
 * @property {string} name
 * @property {RoleScope} scope
 */

/** @type {SystemRoleDefinition[]} */
export const systemRoleDefinitions = [
  // ===== Base-only =====
  { name: "SUPER_ADMIN", scope: "BASE_ONLY" },

  // ===== Admin ====
  { name: "ADMIN", scope: "TENANT" },

  // ===== User =====
  { name: "USER_ADMIN", scope: "TENANT" },
  { name: "USER_EDITOR", scope: "TENANT" },
  { name: "USER_VIEWER", scope: "TENANT" },

  // ===== User =====
  { name: "ROLE_VIEWER", scope: "TENANT" },

  // ===== Role Assignment =====
  { name: "ROLE_ASSIGNMENT_ADMIN", scope: "TENANT" },

];