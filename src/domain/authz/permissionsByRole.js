/**
 * File: src/domain/authz/permissionsByRole.js
 */


/**
 * @typedef {import("./authz.types.js").CrudAction} CrudAction
 * @typedef {import("./authz.types.js").Resource} Resource
 * @typedef {import("./authz.types.js").Role} Role
 */

/**
 * @typedef {{ action: CrudAction, resource: Resource }} Permission
 * @typedef {Readonly<Record<Role, ReadonlyArray<Permission>>>} PermissionsByRole
 */

/**
 * @param {CrudAction} action
 * @param {Resource} resource
 * @returns {Permission}
 */
const p = (action, resource) => ({ action, resource });

/**
 * Helper to assign Read, List actions to a resource
 * @param {Resource} resource
 * @returns {Permission[]}
 */
const resourceViewer = (resource) => [
  p("read", resource),
  p("list", resource),
];

/**
 * Helper to assign Read, Update, List actions to a resource
 * @param {Resource} resource
 * @returns {Permission[]}
 */
const resourceEditor = (resource) => [
  ...resourceViewer(resource),
  p("update", resource),
];

/**
 * Helper to assign Create, Read, Update, Delete, List actions to a resource
 * @param {Resource} resource
 * @returns {Permission[]}
 */
const resourceAdmin = (resource) => [
  ...resourceEditor(resource),
  p("create", resource),
  p("delete", resource),
];


/** @type {PermissionsByRole} */
export const permissionsByRole = Object.freeze({
  SUPER_ADMIN: [
    ...resourceAdmin("tenant"),
    ...resourceAdmin("user"),
    ...resourceAdmin("role"),
    ...resourceAdmin("roleAssignment"),
  ],
  ADMIN: [
    ...resourceAdmin("user"),
    ...resourceViewer("role"),
    ...resourceAdmin("roleAssignment"),
  ],
  USER_ADMIN: [
    ...resourceAdmin("user"),
    ...resourceViewer("role"),
    ...resourceAdmin("roleAssignment"),
  ],
  USER_EDITOR: [
    ...resourceEditor("user"),
    ...resourceViewer("role"),
    ...resourceEditor("roleAssignment"),
  ],
  USER_VIEWER: [
    ...resourceViewer("user"),
    ...resourceViewer("role"),
    ...resourceViewer("roleAssignment"),
  ],
  CONTRACT_ADMIN: [
    ...resourceAdmin("contract"),
  ]
});

export {};
