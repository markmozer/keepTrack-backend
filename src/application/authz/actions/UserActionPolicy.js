/**
 * File: keepTrack-backend/src/application/authz/actions/UserActionPolicy.js
 */

export const userActionPolicy = {
  inviteUser: {
    requiredAbility: "user:update",
  },
  deactivateUser: {
    requiredAbility: "user:update",
  },
  deleteUser: {
    requiredAbility: "user:delete",
  },
  createRoleAssignment: {
    requiredAbility: "roleAssignment:create",
  },
};