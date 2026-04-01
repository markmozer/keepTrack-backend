/**
 * File: src/tests/helpers/factories/tenantFactory.js
 */


import { randomUUID } from "node:crypto";

export function tenantFactory(overrides = {}) {
  return {
    name: "KeepTrack Online",
    slug: `tenant-${randomUUID().slice(0, 8)}`,
    type: "CLIENT",
    status: "ACTIVE",
    ...overrides,
  };
}