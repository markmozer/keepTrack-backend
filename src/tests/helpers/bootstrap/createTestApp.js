/**
 * File: src/tests/helpers/bootstrap/createTestApp.js
 */
import { loadAppConfig } from "../../../app/config/appConfig.js";
import { createApp } from "../../../app/createApp.js";

export async function createTestApp() {
  const appConfig = loadAppConfig();
  return createApp({ appConfig });
}