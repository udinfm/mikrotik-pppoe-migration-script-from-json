# MikroTik PPPoE Secret Export CLI

CLI interaktif Node.js untuk mengambil `ppp secret` dari REST API MikroTik lalu menyimpan:

- file JSON
- file script import MikroTik

Format JSON mengikuti contoh export yang berisi:

- `.id`
- `disabled`
- `name`
- `password`
- `profile`
- `service`

## Warning

File hasil export menyimpan password PPPoE dalam bentuk plaintext.

- Jangan commit file hasil export ke repository.
- Jangan kirim file export ke channel publik atau pihak yang tidak berwenang.
- Simpan file hasil export hanya di folder kerja yang aman.
- Hapus file export setelah proses migrasi selesai jika sudah tidak dibutuhkan.

## Kebutuhan

- Node.js 18 atau lebih baru
- RouterOS dengan REST API aktif
- User MikroTik yang punya akses untuk membaca `ppp secret`

## Jalankan

```bash
npm install
npm start
```

## Alur Interaktif

Saat dijalankan, script akan menanyakan:

- host MikroTik
- username
- password
- service PPP yang mau diambil
- opsi `insecure` untuk sertifikat HTTPS self-signed
- folder output
- timeout request

Setelah data berhasil diambil, script akan:

- menampilkan jumlah secret yang ditemukan
- menampilkan preview script import
- meminta konfirmasi sebelum menyimpan file
- memberi pilihan untuk ulang export lagi atau selesai setelah satu proses berakhir

## Output

Jika folder output belum ada, script akan membuatnya otomatis.

Nama file akan otomatis memakai timestamp tanggal dan waktu, misalnya:

- `mikrotik-secret-2026-05-05_20-15-44.json`
- `mikrotik-import-2026-05-05_20-15-44.txt`

Default folder output pada prompt saat ini adalah:

```text
.\output\with-service
```

Folder `output/` sudah masuk `.gitignore`, jadi hasil export default tidak ikut ter-track oleh git.

Format JSON hasil export berupa array object seperti ini:

```json
[
  {
    ".id": "*2",
    "disabled": "false",
    "name": "user-demo",
    "password": "secret-demo",
    "profile": "V10",
    "service": "pppoe"
  }
]
```

Format script import yang dihasilkan seperti ini:

```text
/ppp secret
add name="user-demo" password="secret-demo" profile="V10" service="pppoe" disabled=no
```

## Catatan HTTPS

Jika router memakai HTTPS dengan sertifikat internal atau self-signed, jawab `yes` pada prompt `Abaikan verifikasi sertifikat HTTPS?`.

## Troubleshooting

- `401` atau `403`: biasanya username, password, atau permission user MikroTik tidak sesuai.
- `timeout`: biasanya host salah, router tidak bisa dijangkau, port tertutup, atau REST API belum aktif.
- `Response bukan JSON valid`: biasanya endpoint REST tidak aktif, URL host salah, atau router mengembalikan halaman login/error non-JSON.
- Tidak ada data ditemukan: cek lagi nilai `service`, karena script hanya menyimpan data yang cocok dengan filter service yang diisi.
