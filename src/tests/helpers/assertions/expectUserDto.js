/**
 * File: src/tests/helpers/assertions/expectUserDto.js
 */


import { expect } from "vitest";

/**
 * @param {any} actual
 * @param {{
 *   id?: string,
 *   tenantId?: string,
 *   email?: string,
 *   status?: string,
 *   roleNames?: string[],
 * }} [expected]
 */
export function expectUserDto(actual, expected = {}) {
  expect(actual).toMatchObject({
    id: expected.id ?? expect.any(String),
    tenantId: expected.tenantId ?? expect.any(String),
    email: expected.email ?? expect.any(String),
    status: expected.status ?? expect.any(String),
    roleNames: expected.roleNames ?? expect.any(Array),
  });

  expect(Array.isArray(actual.roleNames)).toBe(true);
  actual.roleNames.forEach((roleName) => {
    expect(typeof roleName).toBe("string");
  });
}
