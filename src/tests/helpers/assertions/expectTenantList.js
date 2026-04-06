/**
 * File: src/tests/helpers/assertions/expectTenantList.js
 */

import { expectTenantDto } from "./expectTenantDto.js";
import { expectPagedResult } from "./expectPagedResult.js";

export function expectTenantList(result, { page, pageSize }) {
  expectPagedResult(result, { page, pageSize });

  result.items.forEach((tenant) => {
    expectTenantDto(tenant);
  });
}
