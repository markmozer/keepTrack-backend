/**
 * File: src/tests/helpers/factories/userFactory.js
 */
import { randomUUID } from "node:crypto";

export function userFactory(overrides = {}) {
  return {
    email: `user-${randomUUID().slice(0, 8)}@example.com`,
    passwordPlain: "Test123!123",
    inviteTokenHash: null,
    inviteTokenExpiresAt: null,
    resetTokenHash: null,
    resetTokenExpiresAt: null,
    status: "ACTIVE",
    roleNames: [],
    ...overrides,
  };
}