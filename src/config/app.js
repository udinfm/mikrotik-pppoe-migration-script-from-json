/**
 * Metadata aplikasi dikumpulkan di satu file agar gampang diubah
 * tanpa harus mencari teks yang tersebar di banyak file.
 */
export const APP_TITLE = "MikroTik PPPoE Secret Export Tool";

export const APP_DESCRIPTION =
  "CLI interaktif untuk mengambil PPP secret dari REST API MikroTik dan menyimpannya ke JSON serta script import.";

export const APP_CONTACT_MESSAGE =
  "Feel free to contact me Very Shafrudin <very.shafrudin@gmail.com>";

/**
 * Menyusun teks header yang ditampilkan saat CLI pertama kali dibuka.
 * @returns {string[]}
 */
export function getAppIntroLines() {
  return [APP_TITLE, APP_DESCRIPTION, APP_CONTACT_MESSAGE];
}
