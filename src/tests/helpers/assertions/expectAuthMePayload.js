/**
 * File: src/tests/helpers/assertions/expectAuthMeResponse.js
 */

import { expect } from "vitest";

export function expectAuthMePayload(actual, expected = {}) {
  expect(actual).toMatchObject({
        "principal": {
            "userId": expected.userId ?? expect.any(String),
            "tenantId": expected.tenantId ?? expect.any(String),
            "roleNames": expected.roleNames ?? expect.any(Array)
        },
    });

  // extra check (optioneel maar sterk)
  actual.principal.roleNames.forEach((role) => {
    expect(typeof role).toBe("string");
  });
}