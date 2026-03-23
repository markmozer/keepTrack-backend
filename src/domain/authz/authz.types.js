/**
 * File: src/domain/authz/authz.types.js
 */

/**
 * Roles in RBAC context
 * @readonly
 * @enum {string}
 */
export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  USER_ADMIN: 'USER_ADMIN',
  USER_EDITOR: 'USER_EDITOR',
  USER_VIEWER: 'USER_VIEWER',
};

/**
 * CRUD actions in RBAC context
 * @readonly
 * @enum {string}
 */
export const CrudAction = {
  create: 'create',
  read: 'read',
  update: 'update',
  delete: 'delete',
  list: 'list'
};

/**
 * Resources in RBAC context
 * @readonly
 * @enum {string}
 */
export const Resource = {
  tenant: 'tenant',
  user: 'user',
  role: 'role',
  roleAssignment: 'roleAssignment',
};



/**
 * typedef {"ADMIN"|"USER_ADMIN"|"USER_EDITOR"|"USER_VIEWER"} Role
 * typedef {"create"|"read"|"update"|"delete"|"list"} CrudAction
 * typedef {"tenant"|"user"|"role"|"roleAssignment"} Resource
 * @typedef {import("../auth/Principal").Principal} Principal
 */

/**
 * @typedef {Object} AuthzContext
 * @property {string} [resourceId]
 * @property {string} [ownerId]
 * @property {string} [tenantId]
 * @property {string} [useCase]
 * @property {any} [attrs]
 */

/**
 * @typedef {Object} AuthorizeRequest
 * @property {Principal} principal
 * @property {CrudAction} action
 * @property {Resource} resource
 * @property {AuthzContext=} context
 *
 */

export {};
