import fs from "node:fs/promises";
import path from "node:path";

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

function escapeRouterOsString(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function secretToImportLine(secret) {
  const disabled = secret.disabled === "true" ? "yes" : "no";

  return `add name="${escapeRouterOsString(secret.name)}" password="${escapeRouterOsString(secret.password)}" profile="${escapeRouterOsString(secret.profile)}" service="${escapeRouterOsString(secret.service)}" disabled=${disabled}`;
}

export function buildImportScript(secrets) {
  return `/ppp secret\n${secrets.map(secretToImportLine).join("\n")}\n`;
}

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
