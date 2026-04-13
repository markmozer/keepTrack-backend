/**
 * File: src/tests/helpers/assertions/expectUserRoleAdminDto.js
 */

import { expect } from "vitest";
import { expectValidDate } from "./expectValidDate.js";

/**
 * @param {any} actual
 * @param {{
 *   id?: string,
 *   tenantId?: string,
 *   userId?: string,
 *   roleId?: string,
 *   validFrom?: string | null,
 *   validTo?: string | null,
 *   createdAt?: string,
 *   updatedAt?: string,
 *   roleName?: string,
 * }} [expected]
 */
export function expectUserRoleAdminDto(actual, expected = {}) {
  expect(actual).toMatchObject({
    id: expected.id ?? expect.any(String),
    tenantId: expected.tenantId ?? expect.any(String),
    userId: expected.userId ?? expect.any(String),
    roleId: expected.roleId ?? expect.any(String),
    roleName: expected.roleName ?? expect.any(String),
    createdAt: expected.createdAt ?? expect.any(String),
    updatedAt: expected.updatedAt ?? expect.any(String),
  });

  expectNullableDate(actual.validFrom);
  expectNullableDate(actual.validTo);

  expectValidDate(actual.createdAt);
  expectValidDate(actual.updatedAt);

  if (expected.validFrom !== undefined) {
    expectNullableDateEqual(actual.validFrom, expected.validFrom);
  }

  if (expected.validTo !== undefined) {
    expectNullableDateEqual(actual.validTo, expected.validTo);
  }

  if (expected.createdAt !== undefined) {
    expectDateEqual(actual.createdAt, expected.createdAt);
  }

  if (expected.updatedAt !== undefined) {
    expectDateEqual(actual.updatedAt, expected.updatedAt);
  }
}

/**
 * @param {string | null} value
 */
function expectNullableDate(value) {
  if (value === null) {
    expect(value).toBeNull();
    return;
  }

  expect(typeof value).toBe("string");
  expectValidDate(value);
}

/**
 * Vergelijkt twee nullable datumwaarden.
 *
 * @param {string | null} actual
 * @param {string | null} expected
 */
function expectNullableDateEqual(actual, expected) {
  if (expected === null) {
    expect(actual).toBeNull();
    return;
  }

  expect(typeof actual).toBe("string");
  expectDateEqual(actual, expected);
}

/**
 * Vergelijkt twee datumstrings tolerant op kleine precisionverschillen.
 *
 * @param {string} actual
 * @param {string} expected
 */
function expectDateEqual(actual, expected) {
  expectValidDate(actual);
  expectValidDate(expected);

  const actualTime = new Date(actual).getTime();
  const expectedTime = new Date(expected).getTime();

  expect(Math.abs(actualTime - expectedTime)).toBeLessThan(10);
}