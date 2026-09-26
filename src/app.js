'use strict';
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const multer = require('multer');
const config = require('./config');
const { db } = require('./db');
const H = require('./helpers');

const app = express();
app.set('trust proxy', config.trustProxy);
app.set('view engine', 'ejs');
app.set('views', config.viewsDir);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '2mb' }));

app.use(session({
  name: 'tomatgrow.sid',
  secret: config.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.sessionSecure,
    maxAge: 8 * 60 * 60 * 1000,
  },
}));

const findUser = db.prepare("SELECT * FROM users WHERE id=? AND deleted_at IS NULL AND status='Aktif'");
app.use((req, res, next) => {
  req.user = req.session?.userId ? (findUser.get(req.session.userId) || null) : null;
  res.locals.user = req.user;
  res.locals.currentPath = req.path;
  res.locals.appName = config.appName;
  res.locals.appSubtitle = config.appSubtitle;
  res.locals.appVersion = config.version;
  res.locals.schoolName = config.schoolName;
  res.locals.flash = req.session?.flash || null;
  delete req.session.flash;
  res.locals.can = {
    manageUsers: H.perm.canManageUsers(req.user),
    classes: req.user?.role === 'ROOT',
    audit: req.user?.role === 'ROOT',
    backup: req.user?.role === 'ROOT',
  };
  next();
});

app.use('/', require('./router'));

app.use((req, res, next) => next({ status: 404, message: 'Halaman yang Anda cari tidak ditemukan.' }));
app.use((err, req, res, next) => {
  const status = err.status || (err instanceof multer.MulterError ? 400 : 500);
  let message = err.message || 'Terjadi kesalahan pada server.';
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    message = `Ukuran upload terlalu besar. Batas ${Math.floor(config.maxUpload/1024/1024)} MB.`;
  }
  if (status >= 500) console.error('[error]', err);
  if (req.path.startsWith('/api/') || req.accepts(['html','json']) === 'json') {
    return res.status(status).json({ success: false, message });
  }
  return res.status(status).render('error', { status, message, title: `Error ${status}` });
});

module.exports = app;
