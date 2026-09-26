'use strict';
const config = require('./config');
const { migrate, seed } = require('./db');

console.log(`[startup] TOMAT GROW v${config.version}`);
migrate();
seed();

const app = require('./app');
const server = app.listen(config.port, config.host, () => {
  console.log(`[server] listening on http://${config.host}:${config.port}`);
});

let stopping = false;
function stop(signal) {
  if (stopping) return;
  stopping = true;
  console.log(`[server] ${signal} → stopping`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
process.on('uncaughtException', err => { console.error('[fatal]', err); process.exit(1); });
process.on('unhandledRejection', err => { console.error('[fatal]', err); process.exit(1); });
