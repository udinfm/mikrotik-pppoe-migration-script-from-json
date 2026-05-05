import fs from "node:fs/promises";
import path from "node:path";

/**
 * Membuat timestamp aman untuk nama file di Windows.
 * Format memakai tanda hubung pada jam agar tidak bentrok dengan karakter terlarang ":".
 * @returns {string}
 */
function timestampForFilename() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}_${hour}-${minute}-${second}`;
}

/**
 * Escape karakter khusus agar nilai aman dimasukkan ke script import RouterOS.
 * @param {unknown} value
 * @returns {string}
 */
function escapeRouterOsString(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

/**
 * Mengubah satu baris data secret menjadi perintah `add` RouterOS.
 * @param {{
 *   disabled: string,
 *   name: string,
 *   password: string,
 *   profile: string,
 *   service: string
 * }} secret
 * @returns {string}
 */
function secretToImportLine(secret) {
  const disabled = secret.disabled === "true" ? "yes" : "no";

  return `add name="${escapeRouterOsString(secret.name)}" password="${escapeRouterOsString(secret.password)}" profile="${escapeRouterOsString(secret.profile)}" service="${escapeRouterOsString(secret.service)}" disabled=${disabled}`;
}

/**
 * Menyusun seluruh daftar secret menjadi isi file import MikroTik.
 * @param {Array<{
 *   disabled: string,
 *   name: string,
 *   password: string,
 *   profile: string,
 *   service: string
 * }>} secrets
 * @returns {string}
 */
export function buildImportScript(secrets) {
  return `/ppp secret\n${secrets.map(secretToImportLine).join("\n")}\n`;
}

/**
 * Menulis dua file output:
 * - JSON mentah hasil normalisasi
 * - script import RouterOS
 * Folder akan dibuat otomatis jika belum ada.
 * @param {string} outputDir
 * @param {Array<{
 *   ".id": string,
 *   disabled: string,
 *   name: string,
 *   password: string,
 *   profile: string,
 *   service: string
 * }>} secrets
 * @returns {Promise<{jsonPath: string, importPath: string}>}
 */
export async function writeExportFiles(outputDir, secrets) {
  const resolvedDir = path.resolve(outputDir);
  await fs.mkdir(resolvedDir, { recursive: true });

  const timestamp = timestampForFilename();
  const jsonPath = path.join(resolvedDir, `mikrotik-secret-${timestamp}.json`);
  const importPath = path.join(resolvedDir, `mikrotik-import-${timestamp}.txt`);

  const jsonContent = `${JSON.stringify(secrets)}\n`;
  const importContent = buildImportScript(secrets);

  await fs.writeFile(jsonPath, jsonContent, "utf8");
  await fs.writeFile(importPath, importContent, "utf8");

  return { jsonPath, importPath };
}
