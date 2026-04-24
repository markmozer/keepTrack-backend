/**
 * File: src/tests/unit/domain/authz/RolePolicy.test.js
 */


import { describe, it, expect, beforeEach } from "vitest";
import { RolePolicy } from "../../../../domain/authz/RolePolicy.js";
import { permissionsByRole } from "../../../../domain/authz/permissionsByRole.js";
import {
  CrudAction,
  Resource,
  Role,
} from "../../../../domain/authz/authz.types.js";

describe("RolePolicy", () => {
  /** @type {RolePolicy} */
  let policy;

  beforeEach(() => {
    policy = new RolePolicy({ permissionsByRole });
  });

  const makePrincipal = (overrides = {}) => ({
    userId: "user-1",
    tenantId: "tenant-1",
    roleNames: [],
    ...overrides,
  });

  describe("constructor", () => {
    it("throws when permissionsByRole is missing", () => {
      expect(() => new RolePolicy({})).toThrow(
        "RolePolicy: permissionsByRole is required"
      );
    });
  });

  describe("tenant boundary", () => {
    it.each([
      {
        test: "denies when tenantId differs",
        principalTenantId: "tenant-1",
        contextTenantId: "tenant-2",
        roleNames: ["ADMIN"],
        action: CrudAction.read,
        resource: Resource.user,
        expected: false,
      },
      {
        test: "allows when tenantId matches and permission exists",
        principalTenantId: "tenant-1",
        contextTenantId: "tenant-1",
        roleNames: ["ADMIN"],
        action: CrudAction.read,
        resource: Resource.user,
        expected: true,
      },
      {
        test: "ignores tenant check when context tenantId is absent",
        principalTenantId: "tenant-1",
        contextTenantId: undefined,
        roleNames: ["USER_VIEWER"],
        action: CrudAction.read,
        resource: Resource.user,
        expected: true,
      },
    ])("$test", ({ principalTenantId, contextTenantId, roleNames, action, resource, expected }) => {
      const principal = makePrincipal({
        tenantId: principalTenantId,
        roleNames,
      });

      const result = policy.isAllowed({
        principal,
        action,
        resource,
        context: contextTenantId ? { tenantId: contextTenantId } : {},
      });

      expect(result).toBe(expected);
    });
  });

  describe("pure RBAC matrix", () => {
    it.each([
      // ADMIN
      ["ADMIN can read user", ["ADMIN"], CrudAction.read, Resource.user, true],
      ["ADMIN can delete roleAssignment", ["ADMIN"], CrudAction.delete, Resource.roleAssignment, true],
      ["ADMIN can list user", ["ADMIN"], CrudAction.list, Resource.user, true],

      // USER_ADMIN
      ["USER_ADMIN can create user", ["USER_ADMIN"], CrudAction.create, Resource.user, true],
      ["USER_ADMIN can read user", ["USER_ADMIN"], CrudAction.read, Resource.user, true],
      ["USER_ADMIN can update user", ["USER_ADMIN"], CrudAction.update, Resource.user, true],
      ["USER_ADMIN can delete user", ["USER_ADMIN"], CrudAction.delete, Resource.user, true],
      ["USER_ADMIN can list user", ["USER_ADMIN"], CrudAction.list, Resource.user, true],
      ["USER_ADMIN can read role", ["USER_ADMIN"], CrudAction.read, Resource.role, true],

      // USER_EDITOR
      ["USER_EDITOR can read user", ["USER_EDITOR"], CrudAction.read, Resource.user, true],
      ["USER_EDITOR can update user", ["USER_EDITOR"], CrudAction.update, Resource.user, true],
      ["USER_EDITOR can list user", ["USER_EDITOR"], CrudAction.list, Resource.user, true],
      ["USER_EDITOR cannot create user", ["USER_EDITOR"], CrudAction.create, Resource.user, false],
      ["USER_EDITOR cannot delete user", ["USER_EDITOR"], CrudAction.delete, Resource.user, false],

      // USER_VIEWER
      ["USER_VIEWER can read user", ["USER_VIEWER"], CrudAction.read, Resource.user, true],
      ["USER_VIEWER can list user", ["USER_VIEWER"], CrudAction.list, Resource.user, true],
      ["USER_VIEWER cannot update user", ["USER_VIEWER"], CrudAction.update, Resource.user, false],
      ["USER_VIEWER cannot create user", ["USER_VIEWER"], CrudAction.create, Resource.user, false],
      ["USER_VIEWER cannot delete user", ["USER_VIEWER"], CrudAction.delete, Resource.user, false],

      // no/unknown roles
      ["no roles cannot read user", [], CrudAction.read, Resource.user, false],
      ["unknown role cannot read user", ["SOMETHING_ELSE"], CrudAction.read, Resource.user, false],

      // multiple roles
      ["multiple roles grant if one role matches", ["USER_VIEWER", "USER_EDITOR"], CrudAction.update, Resource.user, true],
    ])("%s", (_test, roleNames, action, resource, expected) => {
      const principal = makePrincipal({ roleNames });

      const result = policy.isAllowed({
        principal,
        action,
        resource,
      });

      expect(result).toBe(expected);
    });
  });

  describe("instance-level exception", () => {
    it.each([
      ["allows own user read", CrudAction.read, Resource.user, "user-123", "user-123", true],
      ["allows own user update", CrudAction.update, Resource.user, "user-123", "user-123", true],
      ["denies own user delete", CrudAction.delete, Resource.user, "user-123", "user-123", false],
      ["denies when owner is someone else", CrudAction.read, Resource.user, "user-123", "user-999", false],
      ["denies when resource is not user", CrudAction.read, Resource.role, "user-123", "user-123", false],
    ])(
      "%s",
      (_test, action, resource, principalUserId, ownerId, expected) => {
        const principal = makePrincipal({
          userId: principalUserId,
          roleNames: [],
        });

        const result = policy.isAllowed({
          principal,
          action,
          resource,
          context: { ownerId },
        });

        expect(result).toBe(expected);
      }
    );
  });
});