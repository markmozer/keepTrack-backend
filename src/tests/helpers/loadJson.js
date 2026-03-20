import { readFile } from "fs/promises";

/**
 * Reads a JSON file relative to this module.
 * @param {string} relativePath
 * @returns {Promise<any>}
 */
export async function loadJson(relativePath) {
  const fileUrl = new URL(relativePath, import.meta.url);
  const data = await readFile(fileUrl, "utf-8");

  try {
    return JSON.parse(data);
  } catch {
    throw new Error(`Invalid JSON in file: ${fileUrl.pathname}`);
  }
}