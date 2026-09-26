'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');
const { db } = require('./db');

function str(v) { return v === undefined || v === null ? '' : String(v).trim(); }
function parseId(v) {
  const n = Number.parseInt(v, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}
function parseInt0(v, field, min = 0) {
  if (v === '' || v === undefined || v === null) return null;
  const n = Number(v);
  if (!Number.isInteger(n)) throw new Error(`${field} harus berupa bilangan bulat.`);
  if (n < min) throw new Error(`${field} tidak boleh kurang dari ${min}.`);
  return n;
}
function parseNum(v, field, min = 0) {
  if (v === '' || v === undefined || v === null) return null;
  const n = Number(String(v).replace(',', '.'));
  if (!Number.isFinite(n)) throw new Error(`${field} harus berupa angka.`);
  if (n < min) throw new Error(`${field} tidak boleh kurang dari ${min}.`);
  return n;
}
function parseDate(v, field = 'Tanggal') {
  const s = str(v);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error(`${field} harus berformat YYYY-MM-DD.`);
  const [y,m,d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    throw new Error(`${field} tidak valid.`);
  }
  return s;
}

const perm = {
  isGlobal(u) { return !!u && (u.role === 'ROOT' || u.role === 'GURU'); },
  scopeIds(u) { if (!u) return []; return this.isGlobal(u) ? null : (u.class_id ? [u.class_id] : []); },
  canClass(u, id) { return !!u && (this.isGlobal(u) || u.class_id === id); },
  canTanaman(u, t) { return !!t && this.canClass(u, t.class_id); },
  canEditTanaman(u, t) { return !!u && !!t && (u.role === 'ROOT' || u.role === 'GURU' || (u.role === 'KOORDINATOR' && u.class_id === t.class_id)); },
  canCreateTanaman(u, id) { return !!u && (u.role === 'ROOT' || u.role === 'GURU' || (u.role === 'KOORDINATOR' && u.class_id === id)); },
  canEditRecord(u, t) { return !!u && !!t && this.canTanaman(u, t); },
  canSchedule(u, id) { return !!u && (u.role === 'ROOT' || u.role === 'GURU' || (u.role === 'KOORDINATOR' && u.class_id === id)); },
  canManageUsers(u) { return !!u && ['ROOT','GURU','KOORDINATOR'].includes(u.role); },
  canManageClassUsers(u, id) { return !!u && (u.role === 'ROOT' || u.role === 'GURU' || (u.role === 'KOORDINATOR' && u.class_id === id)); },
};

const auditStmt = db.prepare(`
  INSERT INTO audit_logs(user_id,role,class_id,action,entity,entity_id,result,ip_address,user_agent,before_data,after_data)
  VALUES(?,?,?,?,?,?,?,?,?,?,?)
`);
function audit(req, action, entity = null, entityId = null, result = 'success', before = null, after = null) {
  try {
    const user = req?.user || null;
    const ip = req ? String(req.ip || req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    const ua = req ? String(req.headers?.['user-agent'] || '').slice(0, 250) : '';
    auditStmt.run(user?.id ?? null, user?.role ?? null, user?.class_id ?? null, action, entity, entityId, result, ip, ua,
      before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null);
  } catch (e) {
    console.error('[audit]', e.message);
  }
}

function detectImage(buffer) {
  if (!Buffer.isBuffer(buffer)) return null;
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length >= 8 && buffer.slice(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))) return 'png';
  if (buffer.length >= 12 && buffer.slice(0,4).toString('ascii') === 'RIFF' && buffer.slice(8,12).toString('ascii') === 'WEBP') return 'webp';
  return null;
}
function saveImage(file) {
  if (!file?.buffer) throw new Error('File foto tidak ditemukan.');
  if (file.size > config.maxUpload) throw new Error(`Ukuran file melebihi ${Math.floor(config.maxUpload/1024/1024)} MB.`);
  const detected = detectImage(file.buffer);
  if (!detected) throw new Error('File bukan gambar JPG, PNG, atau WEBP yang valid.');
  const safeName = crypto.randomBytes(18).toString('hex') + '.' + detected;
  fs.writeFileSync(path.join(config.uploadDir, safeName), file.buffer, { mode: 0o640 });
  return { filename: safeName, originalName: path.basename(file.originalname || 'foto'), size: file.size };
}
function deleteImage(filename) {
  const safe = path.basename(str(filename));
  if (!safe) return;
  const full = path.join(config.uploadDir, safe);
  try { if (fs.existsSync(full)) fs.unlinkSync(full); } catch (_) {}
}

module.exports = {
  str, parseId, parseInt0, parseNum, parseDate,
  perm,
  audit,
  detectImage,
  saveImage,
  deleteImage,
};
