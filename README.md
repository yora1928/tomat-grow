# TOMAT GROW 1.0.0

> **Class-Based Plant Monitoring System**
>
> Aplikasi web monitoring tanaman tomat untuk kebutuhan proyek dan tugas kelas. Dibangun dengan Node.js, Express, EJS, SQLite, dan dirancang untuk berjalan di lingkungan Pterodactyl.

---

## Overview

**TOMAT GROW** adalah sistem monitoring tanaman tomat yang memusatkan seluruh pencatatan perkembangan tanaman dalam satu aplikasi.

Sistem dirancang untuk alur kerja berbasis kelas:

```text
Kelas
  │
  ├── Tanaman
  │     ├── Pengamatan
  │     ├── Pengukuran
  │     ├── Perawatan
  │     └── Dokumentasi
  │
  ├── Jadwal
  └── Laporan
```

Setiap data dapat dikelola sesuai hak akses pengguna dan ruang lingkup kelasnya.

---

## Core Capabilities

### Dashboard

Dashboard menjadi pusat informasi aplikasi dan menampilkan:

- Total tanaman.
- Kondisi tanaman berdasarkan status.
- Rata-rata tinggi tanaman.
- Aktivitas pengamatan terbaru.
- Aktivitas perawatan terbaru.
- Jadwal kegiatan terdekat.

Dashboard menggunakan data nyata dari database.

### Data Tanaman

Modul data tanaman menyediakan:

- Tambah tanaman.
- Detail tanaman.
- Edit tanaman.
- Hapus dengan soft delete.
- Pencarian berdasarkan kode atau nama.
- Filter berdasarkan kelas.
- Filter berdasarkan status.
- Riwayat aktivitas tanaman.

Data tanaman dapat menjadi pusat akses menuju seluruh aktivitas monitoring.

### Pengamatan

Pencatatan kondisi tanaman berdasarkan tanggal:

- Kondisi umum.
- Kondisi daun.
- Kondisi batang.
- Kondisi tanah.
- Hama.
- Penyakit.
- Kondisi bunga.
- Kondisi buah.
- Catatan tambahan.

Data pengamatan dapat ditambah, diedit, dan dihapus sesuai hak akses.

### Pengukuran

Pencatatan pertumbuhan tanaman meliputi:

- Tinggi tanaman dalam cm.
- Jumlah daun.
- Jumlah cabang.
- Diameter batang dalam mm.
- Jumlah bunga.
- Jumlah buah.
- Catatan.

Riwayat pengukuran dapat divisualisasikan dalam grafik perkembangan tanaman.

Grafik berjalan secara lokal pada aplikasi dan tidak bergantung pada CDN.

### Perawatan

Aktivitas perawatan tanaman meliputi:

- Penyiraman.
- Pemupukan.
- Penyiangan.
- Pemangkasan.
- Pengendalian hama.
- Pengendalian penyakit.
- Pemasangan penyangga.
- Pembersihan.
- Kegiatan lainnya.

Setiap catatan perawatan menyimpan tanggal, jenis kegiatan, petugas, keterangan, hasil, dan pengguna yang membuat data.

### Dokumentasi

Modul dokumentasi digunakan untuk menyimpan bukti visual perkembangan tanaman.

Kemampuan:

- Upload foto.
- Melihat foto.
- Mengubah metadata foto.
- Mengganti foto.
- Menghapus foto.
- Menghubungkan foto dengan tanaman tertentu.

Format gambar:

```text
JPG
PNG
WEBP
```

Batas ukuran default:

```text
5 MB
```

File tidak hanya diperiksa berdasarkan nama ekstensi, tetapi juga signature file sebelum disimpan.

### Jadwal

Modul jadwal digunakan untuk mengatur kegiatan monitoring dan perawatan:

- Tambah jadwal.
- Edit jadwal.
- Hapus jadwal.
- Kelas terkait.
- Tanggal kegiatan.
- Petugas.
- Status kegiatan.
- Catatan.

Status jadwal:

```text
Belum Dilakukan
Berlangsung
Selesai
Dibatalkan
```

### Laporan

TOMAT GROW dapat menghasilkan laporan dalam format PDF.

Laporan dapat mengambil data nyata dari database, termasuk:

- Identitas tanaman.
- Riwayat pengukuran.
- Riwayat pengamatan.
- Riwayat perawatan.
- Kelas.
- Periode laporan.

### Pengguna dan Role

Sistem menggunakan role:

```text
ROOT
GURU
KOORDINATOR
CONTRIBUTOR
```

#### ROOT

Administrator utama dengan akses penuh terhadap sistem.

Dapat mengelola:

- Pengguna.
- Kelas.
- Data monitoring.
- Audit log.
- Backup.
- System health.
- Laporan.

#### GURU

Pengguna pengelola kegiatan monitoring dengan akses operasional yang lebih luas terhadap data kelas.

#### KOORDINATOR

Pengelola kelas yang bertanggung jawab terhadap data dan anggota kelasnya.

#### CONTRIBUTOR

Anggota kelas yang bertugas mengisi data monitoring.

Contributor bukan akun read-only. Contributor dapat menjalankan aktivitas monitoring pada kelasnya sesuai permission backend, seperti:

- Menambah pengamatan.
- Mengubah data pengamatan.
- Menghapus data pengamatan.
- Menambah pengukuran.
- Mengubah data pengukuran.
- Menghapus data pengukuran.
- Menambah perawatan.
- Mengubah data perawatan.
- Menghapus data perawatan.
- Upload dokumentasi.
- Mengelola dokumentasi yang berada dalam ruang lingkup kelas.
- Melihat data tanaman kelasnya.
- Melihat jadwal dan laporan sesuai ruang lingkup akses.

Ruang lingkup data tetap dibatasi berdasarkan `class_id`.

---

## Permission Model

TOMAT GROW menggunakan pembatasan akses di backend.

Konsep dasarnya:

```text
ROOT
  → seluruh kelas

GURU
  → akses operasional sesuai cakupan yang diberikan

KOORDINATOR
  → kelasnya

CONTRIBUTOR
  → kelasnya
```

Contoh:

```text
CONTRIBUTOR X-A
    │
    ├── Tanaman X-A       → dapat diakses
    ├── Pengamatan X-A    → dapat diinput
    ├── Pengukuran X-A    → dapat diinput
    ├── Perawatan X-A     → dapat diinput
    └── Dokumentasi X-A   → dapat diinput
```

Data kelas lain tidak menjadi bagian dari ruang lingkup contributor tersebut.

Permission tidak hanya bergantung pada tampilan menu. Validasi dilakukan di backend pada endpoint yang menerima perubahan data.

---

## Authentication

Login menggunakan:

- Username atau email.
- Password.
- Session berbasis `express-session`.
- Cookie HTTP-only.
- SameSite `Lax`.
- Opsi secure cookie melalui environment.

Saat login berhasil, session disimpan sebelum redirect agar status autentikasi tidak hilang pada proses redirect.

---

## Audit Log

Aktivitas penting dapat dicatat ke audit log, termasuk aktivitas autentikasi dan perubahan sistem.

Contoh aktivitas:

```text
login
logout
create
update
delete
upload
generate_report
backup
restore
```

Audit menyimpan informasi seperti:

- Waktu.
- User ID.
- Role.
- Class ID.
- Action.
- Entity.
- Entity ID.
- Result.
- IP address.
- User agent.

---

## Backup and Restore

TOMAT GROW menyediakan modul backup untuk menjaga data tetap dapat dipulihkan.

Komponen backup mencakup:

```text
Database SQLite
File upload
Manifest
Checksum
```

Backup database dan file upload dapat dikemas untuk kebutuhan pemulihan.

Restore dibatasi untuk ROOT dan menggunakan konfirmasi sebelum data dipulihkan.

### Rekomendasi penyimpanan

Simpan minimal dua salinan:

```text
SERVER
  └── backups/

KOMPUTER / PENYIMPANAN LAIN
  └── backup TOMAT GROW
```

Dengan demikian aplikasi dapat dideploy ulang pada server baru apabila server sebelumnya tidak tersedia.

---

## Health Check

Endpoint health menyediakan pemeriksaan:

```text
Application
Database
Storage
```

Halaman System Health juga dapat menampilkan informasi kondisi database, storage, disk, status backup terakhir, dan konfigurasi Telegram jika digunakan.

---

## Security

Beberapa perlindungan yang digunakan:

- Password disimpan sebagai hash menggunakan `bcryptjs`.
- Session cookie HTTP-only.
- SameSite cookie.
- Helmet.
- Parameterized SQLite queries.
- Validasi input dasar.
- Validasi tanggal.
- Validasi angka.
- Validasi signature file upload.
- Pembatasan ukuran upload.
- Permission check berdasarkan role.
- Class scope pada backend.
- Soft delete pada beberapa entitas.
- Audit log untuk aktivitas penting.
- Secret diambil dari environment.

Jangan memasukkan credential asli ke repository.

---

## Technology Stack

```text
Runtime
└── Node.js 20+

Backend
├── Express
├── express-session
└── Helmet

Template
└── EJS

Database
└── SQLite / better-sqlite3

Authentication
└── bcryptjs

Upload
└── Multer

PDF
└── PDFKit

Backup
└── Archiver + native Node.js modules
```

---

## Project Structure

```text
tomat-grow/
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── data/
│   └── .gitkeep
├── uploads/
│   └── .gitkeep
├── backups/
│   └── .gitkeep
└── src/
    ├── server.js
    ├── app.js
    ├── config.js
    ├── db.js
    ├── helpers.js
    ├── router.js
    └── views/
        ├── page-start.ejs
        ├── page-end.ejs
        ├── login.ejs
        ├── dashboard.ejs
        ├── tanaman-list.ejs
        ├── tanaman-form.ejs
        ├── tanaman-detail.ejs
        ├── pengamatan-list.ejs
        ├── pengamatan-form.ejs
        ├── pengukuran-list.ejs
        ├── pengukuran-form.ejs
        ├── perawatan-list.ejs
        ├── perawatan-form.ejs
        ├── dokumentasi-list.ejs
        ├── dokumentasi-form.ejs
        ├── jadwal-list.ejs
        ├── jadwal-form.ejs
        ├── users-list.ejs
        ├── users-form.ejs
        ├── laporan.ejs
        ├── classes.ejs
        ├── audit.ejs
        ├── backup.ejs
        ├── health.ejs
        └── error.ejs
```

### Architectural principle

Routing utama dipusatkan pada:

```text
src/router.js
```

Konfigurasi:

```text
src/config.js
```

Database:

```text
src/db.js
```

Helper dan permission:

```text
src/helpers.js
```

Application bootstrap:

```text
src/app.js
src/server.js
```

---

## Requirements

Minimum:

```text
Node.js 20+
npm
Pterodactyl
```

Aplikasi menggunakan SQLite sehingga tidak membutuhkan database server eksternal untuk menjalankan sistem.

---

## Local Installation

Clone atau salin project:

```bash
git clone https://github.com/yora1928/tomat-grow.git
cd tomat-grow
```

Install dependency:

```bash
npm install
```

Jalankan:

```bash
npm start
```

Default host:

```text
0.0.0.0
```

Port:

```text
SERVER_PORT
```

Jika `SERVER_PORT` tidak tersedia, aplikasi menggunakan:

```text
APP_PORT
```

---

## Pterodactyl Deployment

Upload isi project sehingga:

```text
/home/container/package.json
```

berada langsung di root container.

Contoh:

```text
/home/container/
├── package.json
├── .env.example
├── README.md
└── src/
```

Install dan jalankan:

```bash
npm install
npm start
```

Pterodactyl dapat memberikan port melalui:

```text
SERVER_PORT
```

TOMAT GROW memprioritaskan nilai tersebut.

Console normal:

```text
[startup] TOMAT GROW v1.0.0
[db] Schema OK → /home/container/data/tomatgrow.db
[server] listening on http://0.0.0.0:<PORT>
```

Akses:

```text
http://IP-ADDRESS:PORT/
```

Login:

```text
Username: admin
Password: TomatGrow123!
```

Password default harus segera diganti setelah login pertama.

---

## Environment

Salin:

```bash
cp .env.example .env
```

Contoh konfigurasi:

```env
APP_HOST=0.0.0.0
APP_PORT=3000

SECRET_KEY=change-this-to-a-long-random-secret
SESSION_COOKIE_SECURE=0

ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@tomatgrow.local
ADMIN_PASSWORD=TomatGrow123!
ADMIN_NAME=Administrator

SCHOOL_NAME=SMA Negeri Contoh

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Jangan commit file:

```text
.env
```

---

## Database

Database utama:

```text
data/tomatgrow.db
```

Saat startup:

1. Folder database dibuat jika belum ada.
2. Schema dibuat otomatis.
3. Kelas `X-A` sampai `X-K` dibuat jika database masih belum memiliki kelas.
4. ROOT dibuat otomatis jika belum tersedia.

---

## Upload Storage

Lokasi file upload:

```text
uploads/
```

File foto menggunakan nama internal yang dihasilkan sistem.

Nama file asli disimpan sebagai metadata database.

Format yang diterima:

```text
JPG
PNG
WEBP
```

Batas default:

```text
5 MB
```

---

## Application Workflow

Workflow yang direkomendasikan:

```text
1. ROOT membuat dan memeriksa kelas
          ↓
2. ROOT / GURU membuat pengguna
          ↓
3. KOORDINATOR mengelola anggota kelas
          ↓
4. Tanaman dibuat dan dikaitkan ke kelas
          ↓
5. CONTRIBUTOR melakukan monitoring
          ↓
6. Pengamatan dicatat
          ↓
7. Pengukuran dicatat berkala
          ↓
8. Perawatan dicatat
          ↓
9. Dokumentasi foto diunggah
          ↓
10. Jadwal kegiatan dikelola
          ↓
11. Data ditinjau melalui Dashboard
          ↓
12. Laporan PDF dibuat
          ↓
13. Backup dilakukan secara berkala
```

---

## Data Lifecycle

Setiap aktivitas monitoring dapat membentuk histori:

```text
Tanaman
  ├── Pengamatan
  ├── Pengukuran
  ├── Perawatan
  └── Dokumentasi
```

Sehingga detail satu tanaman dapat digunakan sebagai pusat untuk melihat perkembangan dari waktu ke waktu.

---

## GitHub

Repository dapat digunakan untuk menyimpan source code aplikasi.

Yang boleh disimpan:

```text
Source code
package.json
README.md
.env.example
```

Yang tidak boleh disimpan:

```text
.env
node_modules/
data/*.db
uploads/*
backups/*
credential
token
password
```

Gunakan `.gitignore` yang disediakan project.

---

## Backup Strategy

Untuk proyek sekolah, pola sederhana yang direkomendasikan:

```text
Source Code
└── GitHub

Application Package
└── ZIP deployment

Operational Data
└── Database backup

Uploaded Photos
└── Upload backup
```

Simpan backup di luar server produksi secara berkala.

---

## Troubleshooting

### Port tidak sesuai

Periksa allocation Pterodactyl dan nilai:

```text
SERVER_PORT
```

### Database error

Periksa:

```text
data/tomatgrow.db
```

dan log startup:

```text
[db] Schema OK
```

### Upload gagal

Periksa:

- Format file.
- Ukuran file.
- Permission folder `uploads/`.
- Storage server.

### Login gagal

Periksa:

- Username.
- Password.
- Session.
- Log server.

Jangan langsung menghapus database produksi sebelum memastikan data memang tidak dibutuhkan.

---

## Operational Notes

TOMAT GROW dirancang sebagai aplikasi monitoring berbasis data nyata.

Sistem tidak menambahkan data tanaman palsu sebagai isi monitoring.

Data monitoring berasal dari input pengguna:

```text
Pengguna
→ Kelas
→ Tanaman
→ Monitoring
→ Laporan
```

---

## Design Philosophy

Tampilan aplikasi menggunakan pendekatan:

```text
Clean
Structured
Responsive
Professional
Low-noise
```

Fokus utama antarmuka adalah:

- keterbacaan;
- navigasi yang jelas;
- form input yang praktis;
- tabel data yang mudah dipantau;
- detail tanaman sebagai pusat histori;
- kompatibilitas desktop dan mobile.

---

## Version

```text
TOMAT GROW 1.0.0
```

Platform:

```text
Node.js
Express
EJS
SQLite
Pterodactyl
```

---

## License

This project is intended for project and educational use.

---

## Repository

```text
https://github.com/yora1928/tomat-grow
```

---

**TOMAT GROW**

`Class-Based Plant Monitoring System`
