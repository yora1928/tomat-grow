'use strict';
require('dotenv').config();
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const num = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};
const str = (value, fallback = '') => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
};

const config = {
  appName: 'TOMAT GROW',
  appSubtitle: 'Monitoring Tanaman Tomat',
  version: '1.0.0',
  schoolName: str(process.env.SCHOOL_NAME, 'SMA Negeri Contoh'),

  host: str(process.env.APP_HOST, '0.0.0.0'),
  port: num(process.env.SERVER_PORT || process.env.APP_PORT, 3000),
  trustProxy: str(process.env.TRUST_PROXY, '0') === '1',
  publicUrl: str(process.env.PUBLIC_URL, ''),

  secret: str(process.env.SECRET_KEY, 'tomat-grow-secret-key-minimal-32-karakter-random-string'),
  sessionSecure: str(process.env.SESSION_COOKIE_SECURE, '0') === '1',

  adminUser: str(process.env.ADMIN_USERNAME, 'admin').trim().toLowerCase(),
  adminEmail: str(process.env.ADMIN_EMAIL, 'admin@tomatgrow.local').trim().toLowerCase(),
  adminPass: str(process.env.ADMIN_PASSWORD, 'TomatGrow123!'),
  adminName: str(process.env.ADMIN_NAME, 'Administrator'),

  dbFile: path.join(ROOT, 'data', 'tomatgrow.db'),
  uploadDir: path.join(ROOT, 'uploads'),
  backupDir: path.join(ROOT, 'backups'),
  viewsDir: path.join(ROOT, 'src', 'views'),
  maxUpload: num(process.env.MAX_UPLOAD_SIZE, 5 * 1024 * 1024),

  tgToken: str(process.env.TELEGRAM_BOT_TOKEN, ''),
  tgChat: str(process.env.TELEGRAM_CHAT_ID, ''),
};

if (config.secret.length < 32) {
  console.warn('[config] WARNING: SECRET_KEY kurang dari 32 karakter.');
}

module.exports = config;
