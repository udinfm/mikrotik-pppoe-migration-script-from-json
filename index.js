import chalk from "chalk";
import {
  promptExportConfig,
  promptRepeatAction,
  promptSaveConfirmation,
} from "./src/cli/prompts.js";
import { getAppIntroLines } from "./src/config/app.js";
import { fetchSecrets } from "./src/mikrotik/fetch.js";
import { buildImportScript, writeExportFiles } from "./src/export/files.js";

/**
 * Menjalankan satu siklus export:
 * 1. minta parameter koneksi,
 * 2. ambil data dari MikroTik,
 * 3. tampilkan preview,
 * 4. simpan file jika user setuju.
 * Nilai balik `true` berarti user ingin mengulangi proses lagi.
 * @returns {Promise<boolean>}
 */
async function runExportFlow() {
  console.log(chalk.yellow("Step 1: Masukkan koneksi MikroTik"));
  const exportConfig = await promptExportConfig();

  console.log(chalk.yellow("\nStep 2: Ambil data PPP secret dari MikroTik..."));
  const secrets = await fetchSecrets(exportConfig);

  if (secrets.length === 0) {
    console.log(chalk.red("\nTidak ada secret yang cocok dengan filter service."));
    return promptRepeatAction();
  }

  console.log(chalk.green(`\nDitemukan ${secrets.length} secret.`));
  console.log(chalk.gray(`Folder output: ${exportConfig.outputDir}`));
  console.log(chalk.gray(`Nama file akan memakai timestamp tanggal dan waktu.`));

  // Preview dibatasi beberapa baris supaya user bisa sanity-check
  // hasil export tanpa memenuhi terminal.
  const preview = buildImportScript(secrets)
    .split("\n")
    .slice(0, 6)
    .join("\n");
  console.log(chalk.yellow("\nPreview import script:"));
  console.log(chalk.gray(preview));

  const shouldSave = await promptSaveConfirmation();
  if (!shouldSave) {
    console.log(chalk.yellow("\nPenyimpanan dibatalkan user."));
    return promptRepeatAction();
  }

  console.log(chalk.yellow("\nStep 3: Simpan file export..."));
  const savedFiles = await writeExportFiles(exportConfig.outputDir, secrets);

  console.log(chalk.green.bold("\n✓ Export selesai!\n"));
  console.log(chalk.green(`JSON  : ${savedFiles.jsonPath}`));
  console.log(chalk.green(`IMPORT: ${savedFiles.importPath}`));
  return promptRepeatAction();
}

/**
 * Menjalankan CLI sampai user memilih selesai.
 * Error tetap dianggap fatal agar user segera tahu bila ada masalah koneksi atau response.
 * @returns {Promise<void>}
 */
async function main() {
  try {
    const [appTitle, appDescription, appContactMessage] = getAppIntroLines();
    console.log(chalk.cyan.bold(`\n=== ${appTitle} ===`));
    console.log(chalk.gray(appDescription));
    console.log(chalk.gray(appContactMessage));
    console.log("");

    let shouldRepeat = true;
    while (shouldRepeat) {
      shouldRepeat = await runExportFlow();

      if (shouldRepeat) {
        console.log(chalk.cyan("\nMemulai export baru...\n"));
      }
    }

    console.log(chalk.cyan("\nCLI selesai. Sampai jumpa.\n"));
  } catch (error) {
    console.error(chalk.red.bold("\n✗ Error:"), error.message);
    process.exit(1);
  }
}

main();
