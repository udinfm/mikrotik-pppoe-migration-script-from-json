import inquirer from "inquirer";

// Folder default dibuat relatif ke repo agar aman dipakai di mesin mana pun.
const DEFAULT_OUTPUT_DIR = ".\\output\\with-service";

/**
 * Mengumpulkan semua input yang dibutuhkan sebelum request ke MikroTik dijalankan.
 * Validasi dilakukan di level prompt agar error dasar tertangkap lebih awal.
 * @returns {Promise<{
 *   host: string,
 *   username: string,
 *   password: string,
 *   service: string,
 *   insecure: boolean,
 *   outputDir: string,
 *   timeoutMs: number
 * }>}
 */
export async function promptExportConfig() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "host",
      message: "MikroTik Host / Base URL:",
      default: "192.168.88.1",
      validate: (input) => {
        if (!String(input || "").trim()) {
          return "Host MikroTik wajib diisi";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "username",
      message: "Username MikroTik:",
      default: "admin",
      validate: (input) => {
        if (!String(input || "").trim()) {
          return "Username MikroTik wajib diisi";
        }
        return true;
      },
    },
    {
      type: "password",
      name: "password",
      message: "Password MikroTik:",
      mask: "*",
      validate: (input) => {
        if (!String(input || "").trim()) {
          return "Password MikroTik wajib diisi";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "service",
      message: "Filter service PPP:",
      default: "pppoe",
      validate: (input) => {
        if (!String(input || "").trim()) {
          return "Service wajib diisi";
        }
        return true;
      },
    },
    {
      type: "confirm",
      name: "insecure",
      message: "Abaikan verifikasi sertifikat HTTPS?",
      default: true,
    },
    {
      type: "input",
      name: "outputDir",
      message: "Folder output simpan file:",
      default: DEFAULT_OUTPUT_DIR,
      filter: (input) => String(input || "").trim(),
      validate: (input) => {
        if (!String(input || "").trim()) {
          return "Folder output wajib diisi";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "timeoutMs",
      message: "Timeout request dalam milidetik:",
      default: "30000",
      validate: (input) => {
        if (!/^\d+$/.test(String(input || "").trim())) {
          return "Timeout harus berupa angka";
        }
        if (Number.parseInt(input, 10) <= 0) {
          return "Timeout harus lebih dari 0";
        }
        return true;
      },
    },
  ]);

  return {
    host: answers.host,
    username: answers.username,
    password: answers.password,
    service: answers.service,
    insecure: answers.insecure,
    outputDir: answers.outputDir,
    timeoutMs: Number.parseInt(answers.timeoutMs, 10),
  };
}

/**
 * Meminta konfirmasi akhir sebelum file benar-benar ditulis ke disk.
 * @returns {Promise<boolean>}
 */
export async function promptSaveConfirmation() {
  const { shouldSave } = await inquirer.prompt([
    {
      type: "confirm",
      name: "shouldSave",
      message: "Simpan file JSON dan script import ke folder output?",
      default: true,
    },
  ]);

  return shouldSave;
}
