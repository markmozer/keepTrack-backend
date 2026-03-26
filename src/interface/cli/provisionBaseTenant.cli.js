/**
 * File: src/interface/cli/provisionBaseTenant.cli.js
 */
import { getEnv } from "../../shared/config/env.js";
import { buildContainer } from "../../app/buildContainer.js";
import { createProvisioningPrincipal } from "../../application/auth/createProvisioningPrincipal.js";

function getArgValue(args, name) {
  const prefix = `--${name}=`;
  const arg = args.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

function requireArg(value, name) {
  if (!value || typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required argument: --${name}=...`);
  }
  return value.trim();
}

function printHelp() {
  console.log(`
Usage:
  npm run provision:base-tenant -- --name="..." --slug="..." --adminEmail="..."

Arguments:
  --name=...         Tenant name
  --slug=...         Tenant slug
  --adminEmail=...   Email address of the first SUPER_ADMIN user
`);
}

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

  if (getEnv("NODE_ENV", "development") !== "production") {
  try {
    await import("dotenv/config");
  } catch (e) {
    // dotenv niet geïnstalleerd → negeren
  }
}
  let shutdown;

  try {
    const args = process.argv.slice(2);

    if (args.includes("--help")) {
      printHelp();
      process.exit(0);
    }

    const name = requireArg(getArgValue(args, "name"), "name");
    const slug = requireArg(getArgValue(args, "slug"), "slug");
    const adminEmail = requireArg(
      getArgValue(args, "adminEmail"),
      "adminEmail",
    );

    const container = buildContainer();
    shutdown = container.shutdown;

    const principal = createProvisioningPrincipal();

    const result = await container.provisioning.provisionBaseTenant.execute({
      principal,
      payload: {
        name,
        slug,
        adminEmail,
      },
    });

    console.log("✅ ProvisionBaseTenant completed successfully.");
    console.log(JSON.stringify(result, null, 2));

    if (typeof shutdown === "function") {
      await shutdown();
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ ProvisionBaseTenant failed.");

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
