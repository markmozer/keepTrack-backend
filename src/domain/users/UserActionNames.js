/**
 * File: src/domain/users/UserActionNames.js
 */


/**
 * @typedef { "inviteUser" | "deactivateUser" | "deleteUser" | "createRoleAssignment" } UserActionName
 */

/**
 * @typedef { "updateRoleAssignment" | "deleteRoleAssignment" } UserRoleActionName
 */

export const UserActionName = Object.freeze({
  inviteUser: "inviteUser",
  deactivateUser: "deactivateUser",
  deleteUser: "deleteUser",
  createRoleAssignment: "createRoleAssignment",
});

export const UserRoleActionName = Object.freeze({
  updateRoleAssignment: "updateRoleAssignment",
  deleteRoleAssignment: "deleteRoleAssignment",
});