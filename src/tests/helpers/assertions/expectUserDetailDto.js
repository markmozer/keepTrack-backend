/**
 * File: src/tests/helpers/assertions/expectUserAdminDto.js
 */

import { expect } from "vitest";
import { expectValidDate } from "./expectValidDate.js";

/**
 * @param {any} actual
 * @param {{
 *   id?: string,
 *   tenantId?: string,
 *   email?: string,
 *   status?: string,
 *   userRoles?: 
 *    {
 *      id?: string,
 *      roleId?: string,
 *      validFrom?: Date, 
 *      validTo?: Date | null, 
 *      createdAt?: Date, 
 *      updatedAt?: Date, 
 *      roleName?: string | null
 *    }[],
 *   inviteTokenExpiresAt?: string | Date | null,
 *   resetTokenExpiresAt?: string | Date | null,
 *   createdAt?: string | Date,
 *   updatedAt?: string | Date,
 * }} [expected]
 */
export function expectUserDetailDto(actual, expected = {}) {
  expect(actual).toMatchObject({
    id: expected.id ?? expect.any(String),
    tenantId: expected.tenantId ?? expect.any(String),
    email: expected.email ?? expect.any(String),
    status: expected.status ?? expect.any(String),
    userRoles: expect.any(Array),
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  });

  expect(Array.isArray(actual.userRoles)).toBe(true);
  actual.userRoles.forEach((userRole) => {
    expect(typeof userRole.id).toBe("string");
    expect(typeof userRole.roleId).toBe("string");
    expectValidDate(userRole.validFrom);
    expectNullableDate(userRole.validTo);
    expectValidDate(userRole.createdAt);
    expectValidDate(userRole.updatedAt);
    expect(typeof userRole.roleName).toBe("string");
  });

  expectValidDate(actual.createdAt);
  expectValidDate(actual.updatedAt);

  expectNullableDate(actual.inviteTokenExpiresAt);
  expectNullableDate(actual.resetTokenExpiresAt);

  if (expected.inviteTokenExpiresAt !== undefined) {
    expectNullableDateEqual(
      actual.inviteTokenExpiresAt,
      expected.inviteTokenExpiresAt,
    );
  }

  if (expected.resetTokenExpiresAt !== undefined) {
    expectNullableDateEqual(
      actual.resetTokenExpiresAt,
      expected.resetTokenExpiresAt,
    );
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
 * @param {string | null} actual
 * @param {string | Date | null} expected
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
 * @param {string} actual
 * @param {string | Date} expected
 */
function expectDateEqual(actual, expected) {
  expectValidDate(actual);

  const actualTime = new Date(actual).getTime();
  const expectedTime = toTimestamp(expected);

  expect(Math.abs(actualTime - expectedTime)).toBeLessThan(10);
}

/**
 * @param {string | Date} value
 * @returns {number}
 */
function toTimestamp(value) {
  if (value instanceof Date) {
    expect(Number.isNaN(value.getTime())).toBe(false);
    return value.getTime();
  }

  expectValidDate(value);
  return new Date(value).getTime();
}
