/**
 * File: keepTrack-backend/src/application/authz/actions/UserRoleActionPolicy.js
 */

export const userRoleActionPolicy = {
  updateRoleAssignment: {
    requiredAbility: "roleAssignment:update",
  },
  deleteRoleAssignment: {
    requiredAbility: "roleAssignment:delete",
  },
};