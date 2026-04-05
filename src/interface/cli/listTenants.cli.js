/**
 * File: src/interface/cli/provisionBaseTenant.cli.js
 */
import { getEnv } from "../../app/config/env.js";
import { loadAppConfig } from "../../app/config/appConfig.js";
import { buildContainer } from "../../app/buildContainer.js";
import { normalizePagination } from "../../application/shared/pagination/normalizePagination.js";
import { normalizeGetTenantsFilters } from "../../application/tenants/normalizeGetTenantsFilters.js";
import { normalizeGetTenantsSort } from "../../application/tenants/normalizeGetTenantsSort.js";

/**
 * @param {string} value
 * @returns {NodeEnv}
 */
function parseNodeEnv(value) {
  if (value === "test" || value === "production") {
    return value;
  }
  return "development";
}

async function main() {
  const nodeEnv = parseNodeEnv(getEnv("NODE_ENV", "development"));

  if (nodeEnv !== "production") {
    try {
      await import("dotenv/config");
    } catch (e) {
      // dotenv niet geïnstalleerd → negeren
    }
  }
  let shutdown;

  try {
    const appConfig = loadAppConfig();
    const container = buildContainer({ appConfig });
    shutdown = container.shutdown;


    const pagination = normalizePagination();
    const filters = normalizeGetTenantsFilters();
    const sort = normalizeGetTenantsSort();

    const result = await container.repositories.tenantRepository.findPage({
      pagination,
      filters,
      sort,
    });

    
    console.dir(result, {depth: null});

    if (typeof shutdown === "function") {
      await shutdown();
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ listTenants failed.");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    if (typeof shutdown === "function") {
      try {
        await shutdown();
      } catch (shutdownError) {
        console.error("Shutdown failed:", shutdownError);
      }
    }

    process.exit(1);
  }
}

main();
