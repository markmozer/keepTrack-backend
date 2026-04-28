/**
 * File: src/tests/unit/domain/authz/userRoleValidity.test.js
 */

import { describe, it, expect } from "vitest";
import {
  getNextRoleEffectiveAt,
  hasRoleEffectiveAt,
  hasRoleEffectiveNowOrFuture,
  isRoleEffectiveAt,
} from "../../../../domain/authz/userRoleValidity.js";

describe("userRoleValidity", () => {
  const now = new Date("2026-04-26T10:00:00.000Z");

  it("treats a role as effective at when validFrom is in the past and validTo is open", () => {
    const role = {
      validFrom: new Date("2026-04-20T10:00:00.000Z"),
      validTo: null,
    };

    expect(isRoleEffectiveAt(role, now)).toBe(true);
  });

  it("treats a future role as not effective yet but valid now or in the future", () => {
    const roles = [
      {
        validFrom: new Date("2026-05-01T10:00:00.000Z"),
        validTo: null,
      },
    ];

    expect(hasRoleEffectiveAt(roles, now)).toBe(false);
    expect(hasRoleEffectiveNowOrFuture(roles, now)).toBe(true);
    expect(getNextRoleEffectiveAt(roles, now)?.toISOString()).toBe(
      "2026-05-01T10:00:00.000Z",
    );
  });

  it("treats fully expired roles as neither effective now nor in the future", () => {
    const roles = [
      {
        validFrom: new Date("2026-04-01T10:00:00.000Z"),
        validTo: new Date("2026-04-10T10:00:00.000Z"),
      },
    ];

    expect(hasRoleEffectiveAt(roles, now)).toBe(false);
    expect(hasRoleEffectiveNowOrFuture(roles, now)).toBe(false);
    expect(getNextRoleEffectiveAt(roles, now)).toBeNull();
  });
});
