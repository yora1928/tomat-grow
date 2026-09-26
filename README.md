# TOMAT GROW 1.0.0

TOMAT GROW adalah aplikasi monitoring tanaman tomat berbasis Node.js, Express, EJS, SQLite, dan Pterodactyl.

## Fitur

- Login berbasis session dan role: ROOT, GURU, KOORDINATOR, CONTRIBUTOR.
- Dashboard statistik tanaman dan aktivitas terbaru.
- Data tanaman: tambah, detail, edit, hapus (soft delete), pencarian, filter status dan kelas.
- Pengamatan: tambah, edit, hapus.
- Pengukuran: tambah, edit, hapus, grafik perkembangan lokal tanpa CDN.
- Perawatan: tambah, edit, hapus.
- Dokumentasi: upload, lihat, edit metadata, ganti foto, hapus.
- Jadwal: tambah, edit, hapus.
- Pengguna: tambah, edit, nonaktifkan sesuai hak akses.
- Kelas: tambah dan aktif/nonaktif (ROOT).
- Audit log aktivitas.
- Laporan PDF.
- Backup database + file upload dan restore database.
- Health check untuk database dan storage.

## Pterodactyl

Upload isi folder `tomat-grow` sehingga `package.json` berada tepat di `/home/container/package.json`.

Startup command:

```bash
npm install && npm start
```

Node.js minimal: 20.

Pterodactyl menetapkan port melalui `SERVER_PORT`; aplikasi memprioritaskan nilai tersebut daripada `APP_PORT`.

Login pertama menggunakan nilai pada environment:

```text
Username: admin
Password: TomatGrow123!
```

Segera ubah password ROOT melalui menu Pengguna.

## Database

Saat start, schema akan dibuat otomatis dan kelas X-A sampai X-K akan tersedia. Database berada di `data/tomatgrow.db`.

## Catatan upload

Format yang diterima: JPG, PNG, WEBP. Ukuran maksimum default 5 MB. File divalidasi berdasarkan extension dan signature file sebelum disimpan.
