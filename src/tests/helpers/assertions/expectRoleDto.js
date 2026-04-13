/**
 * File: src/tests/helpers/assertions/expectRoleDto.js
 */


import { expect } from "vitest";

export function expectRoleDto(actual, expected = {}) {
  expect(actual).toMatchObject({
        "id": expected.id ?? expect.any(String),
        "tenantId": expected.tenantId ?? expect.any(String),
        "name": expected.name ?? expect.any(String)
    },
    );
}