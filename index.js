import chalk from "chalk";
import { promptExportConfig, promptSaveConfirmation } from "./src/cli/prompts.js";
import { fetchSecrets } from "./src/mikrotik/fetch.js";
import { buildImportScript, writeExportFiles } from "./src/export/files.js";

/**
 * Menjalankan alur CLI utama:
 * 1. minta parameter koneksi,
 * 2. ambil data dari MikroTik,
 * 3. tampilkan preview,
 * 4. simpan file jika user setuju.
 * @returns {Promise<void>}
 */
async function main() {
  try {
    console.log(chalk.cyan.bold("\n=== MikroTik PPPoE Secret Export Tool ===\n"));

    console.log(chalk.yellow("Step 1: Masukkan koneksi MikroTik"));
    const exportConfig = await promptExportConfig();

    console.log(chalk.yellow("\nStep 2: Ambil data PPP secret dari MikroTik..."));
    const secrets = await fetchSecrets(exportConfig);

    if (secrets.length === 0) {
      console.log(chalk.red("\nTidak ada secret yang cocok dengan filter service."));
      process.exit(0);
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
      process.exit(0);
    }

    console.log(chalk.yellow("\nStep 3: Simpan file export..."));
    const savedFiles = await writeExportFiles(exportConfig.outputDir, secrets);

    console.log(chalk.green.bold("\n✓ Export selesai!\n"));
    console.log(chalk.green(`JSON  : ${savedFiles.jsonPath}`));
    console.log(chalk.green(`IMPORT: ${savedFiles.importPath}`));
  } catch (error) {
    console.error(chalk.red.bold("\n✗ Error:"), error.message);
    process.exit(1);
  }
}

main();
