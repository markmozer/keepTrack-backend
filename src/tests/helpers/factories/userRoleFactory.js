/**
 * File: src/tests/helpers/factories/userRoleFactory.js
 */

export function userRoleFactory(overrides = {}) {
  return {
    validFrom: new Date(),
    validTo: null,
    ...overrides,
  };
}