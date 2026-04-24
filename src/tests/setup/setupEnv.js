/**
 * File: src/tests/setup/setupEnv.js
 */


import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env.test"),
  override: true,
  quiet: true,
});

if (!process.env.APP_PROTOCOL) {
  process.env.APP_PROTOCOL = "https";
}

if (!process.env.APP_BASE_DOMAIN) {
  process.env.APP_BASE_DOMAIN = "keeptrack.test";
}

if (!process.env.PORT) {
  process.env.PORT = "3000";
}
