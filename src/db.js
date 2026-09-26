'use strict';
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const config = require('./config');

for (const dir of [path.dirname(config.dbFile), config.uploadDir, config.backupDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(config.dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kode_kelas TEXT UNIQUE NOT NULL,
  nama_kelas TEXT NOT NULL,
  tingkat TEXT NOT NULL DEFAULT 'X',
  status TEXT NOT NULL DEFAULT 'Aktif',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nama TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CONTRIBUTOR',
  class_id INTEGER REFERENCES classes(id),
  created_by INTEGER,
  status TEXT NOT NULL DEFAULT 'Aktif',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login TEXT,
  deleted_at TEXT,
  deleted_by INTEGER
);
CREATE TABLE IF NOT EXISTS tanaman (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kode_tanaman TEXT UNIQUE NOT NULL,
  nama_tanaman TEXT NOT NULL,
  varietas TEXT,
  tanggal_tanam TEXT NOT NULL,
  class_id INTEGER NOT NULL REFERENCES classes(id),
  lokasi TEXT,
  posisi TEXT,
  status TEXT NOT NULL DEFAULT 'Sehat',
  catatan TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  deleted_by INTEGER
);
CREATE TABLE IF NOT EXISTS pengamatan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tanaman_id INTEGER NOT NULL REFERENCES tanaman(id) ON DELETE CASCADE,
  tanggal TEXT NOT NULL,
  kondisi_daun TEXT,
  kondisi_batang TEXT,
  kondisi_tanah TEXT,
  kondisi_umum TEXT,
  hama TEXT,
  penyakit TEXT,
  kondisi_bunga TEXT,
  kondisi_buah TEXT,
  catatan TEXT,
  pengamat_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE TABLE IF NOT EXISTS pengukuran (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tanaman_id INTEGER NOT NULL REFERENCES tanaman(id) ON DELETE CASCADE,
  tanggal TEXT NOT NULL,
  tinggi_cm REAL,
  jumlah_daun INTEGER,
  jumlah_cabang INTEGER,
  diameter_batang_mm REAL,
  jumlah_bunga INTEGER,
  jumlah_buah INTEGER,
  catatan TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE TABLE IF NOT EXISTS perawatan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tanaman_id INTEGER NOT NULL REFERENCES tanaman(id) ON DELETE CASCADE,
  tanggal TEXT NOT NULL,
  jenis_kegiatan TEXT NOT NULL,
  petugas TEXT,
  keterangan TEXT,
  hasil TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE TABLE IF NOT EXISTS dokumentasi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tanaman_id INTEGER NOT NULL REFERENCES tanaman(id) ON DELETE CASCADE,
  tanggal TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT,
  keterangan TEXT,
  uploaded_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE TABLE IF NOT EXISTS jadwal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tanggal TEXT NOT NULL,
  class_id INTEGER NOT NULL REFERENCES classes(id),
  kegiatan TEXT NOT NULL,
  petugas TEXT,
  status TEXT NOT NULL DEFAULT 'Belum Dilakukan',
  catatan TEXT,
  created_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  user_id INTEGER,
  role TEXT,
  class_id INTEGER,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id INTEGER,
  result TEXT NOT NULL DEFAULT 'success',
  ip_address TEXT,
  user_agent TEXT,
  before_data TEXT,
  after_data TEXT
);
CREATE TABLE IF NOT EXISTS backup_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  folder TEXT NOT NULL,
  size_bytes INTEGER,
  checksum TEXT,
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  telegram_status TEXT NOT NULL DEFAULT 'SKIPPED',
  message TEXT,
  triggered_by INTEGER
);
CREATE INDEX IF NOT EXISTS idx_tanaman_class ON tanaman(class_id);
CREATE INDEX IF NOT EXISTS idx_tanaman_status ON tanaman(status);
CREATE INDEX IF NOT EXISTS idx_pengamatan_tanaman ON pengamatan(tanaman_id);
CREATE INDEX IF NOT EXISTS idx_pengukuran_tanaman ON pengukuran(tanaman_id);
CREATE INDEX IF NOT EXISTS idx_perawatan_tanaman ON perawatan(tanaman_id);
CREATE INDEX IF NOT EXISTS idx_dokumentasi_tanaman ON dokumentasi(tanaman_id);
CREATE INDEX IF NOT EXISTS idx_jadwal_class ON jadwal(class_id);
CREATE INDEX IF NOT EXISTS idx_jadwal_tanggal ON jadwal(tanggal);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
`);

function hasColumn(table, column) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some(c => c.name === column);
}
function addColumn(table, column, definition) {
  if (!hasColumn(table, column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`[db] Added ${table}.${column}`);
  }
}
function migrate() {
  addColumn('users', 'updated_at', "TEXT NOT NULL DEFAULT ''");
  addColumn('tanaman', 'updated_at', "TEXT NOT NULL DEFAULT ''");
  addColumn('tanaman', 'deleted_by', 'INTEGER');
  addColumn('pengamatan', 'updated_at', "TEXT NOT NULL DEFAULT ''");
  addColumn('pengukuran', 'updated_at', "TEXT NOT NULL DEFAULT ''");
  addColumn('perawatan', 'updated_at', "TEXT NOT NULL DEFAULT ''");
  addColumn('dokumentasi', 'updated_at', "TEXT NOT NULL DEFAULT ''");
  addColumn('jadwal', 'updated_at', "TEXT NOT NULL DEFAULT ''");
  addColumn('audit_logs', 'before_data', 'TEXT');
  addColumn('audit_logs', 'after_data', 'TEXT');
  addColumn('backup_logs', 'checksum', 'TEXT');
  console.log('[db] Schema OK →', config.dbFile);
}

function seed() {
  const classInsert = db.prepare('INSERT OR IGNORE INTO classes (kode_kelas,nama_kelas,tingkat) VALUES (?,?,?)');
  let count = 0;
  db.transaction(() => {
    for (const letter of 'ABCDEFGHIJK') {
      count += classInsert.run(`X-${letter}`, `Kelas X-${letter}`, 'X').changes;
    }
  })();
  if (count) console.log('[db] Kelas X-A s.d. X-K tersedia.');

  const root = db.prepare("SELECT id FROM users WHERE role='ROOT' LIMIT 1").get();
  if (!root) {
    const conflict = db.prepare('SELECT id FROM users WHERE lower(username)=? OR lower(email)=? LIMIT 1').get(config.adminUser, config.adminEmail);
    if (conflict) throw new Error('Username/email admin default sudah digunakan oleh akun lain.');
    db.prepare(`INSERT INTO users(username,email,password_hash,nama,role,status) VALUES(?,?,?,?, 'ROOT','Aktif')`)
      .run(config.adminUser, config.adminEmail, bcrypt.hashSync(config.adminPass, 10), config.adminName);
    console.log('==================================================');
    console.log(' ROOT TOMAT GROW dibuat otomatis');
    console.log(' Username : ' + config.adminUser);
    console.log(' Password : ' + config.adminPass);
    console.log(' Ganti password setelah login pertama.');
    console.log('==================================================');
  }
}

module.exports = { db, migrate, seed };
