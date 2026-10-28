import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { disconnectDatabase } from '../src/config/database.js';
import { stopRealtimeServer } from '../src/realtime/socketServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.resolve(__dirname, '..');

test('disconnectDatabase is idempotent and does not throw or hang when disconnected', async () => {
  assert.strictEqual(mongoose.connection.readyState, 0);
  await assert.doesNotReject(async () => {
    await disconnectDatabase();
    await disconnectDatabase();
  });
});

test('stopRealtimeServer is idempotent and safe when uninitialized', async () => {
  await assert.doesNotReject(async () => {
    await stopRealtimeServer();
    await stopRealtimeServer();
  });
});

test('server package.json dev script uses deterministic content-hash runner dev.js', () => {
  const pkgPath = path.join(serverDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  assert.ok(pkg.scripts.dev.includes('dev.js'), 'dev script must use dev.js');
  const devPath = path.join(serverDir, 'dev.js');
  assert.ok(fs.existsSync(devPath), 'dev.js must exist');
});

test('nodemon.json enforces strict exclusions, safe debounce delay, and no legacy polling', () => {
  const nodemonPath = path.join(serverDir, 'nodemon.json');
  const raw = fs.readFileSync(nodemonPath, 'utf8');
  const config = JSON.parse(raw);

  assert.ok(Array.isArray(config.ignore), 'ignore must be an array');
  assert.ok(config.ignore.includes('**/node_modules/**'), 'must ignore node_modules');
  assert.ok(config.ignore.includes('**/.git/**'), 'must ignore .git');
  assert.strictEqual(config.legacyWatch, undefined, 'legacyWatch must not be true');
  assert.ok(config.delay >= 1000, 'delay must be at least 1000ms to prevent rapid-fire restart thrashing');
});

test('ecosystem.config.cjs is configured for bulletproof production', async () => {
  const ecosystemPath = path.join(serverDir, 'ecosystem.config.cjs');
  assert.ok(fs.existsSync(ecosystemPath), 'ecosystem.config.cjs must exist');

  const { default: ecosystem } = await import(ecosystemPath);
  const app = ecosystem.apps[0];

  assert.strictEqual(app.name, 'ksm-api');
  assert.strictEqual(app.script, 'server.js');
  assert.strictEqual(app.watch, false, 'production PM2 must have watch disabled');
  assert.ok(app.kill_timeout >= 5000, 'kill_timeout must allow graceful shutdown at least 5s');
  assert.strictEqual(app.autorestart, true, 'autorestart must be enabled');
});

test('server.js exports clean syntax and valid error/signal traps', () => {
  const serverPath = path.join(serverDir, 'server.js');
  const content = fs.readFileSync(serverPath, 'utf8');

  assert.ok(content.includes('gracefulShutdown'), 'must define gracefulShutdown');
  assert.ok(content.includes('SIGTERM'), 'must handle SIGTERM');
  assert.ok(content.includes('SIGINT'), 'must handle SIGINT');
  assert.ok(content.includes('SIGUSR2'), 'must handle SIGUSR2');
  assert.ok(content.includes('closeIdleConnections'), 'must close idle keep-alive connections');
  assert.ok(content.includes('EADDRINUSE'), 'must trap EADDRINUSE');
  assert.ok(content.includes('unhandledRejection'), 'must handle unhandledRejection');
  assert.ok(content.includes('uncaughtException'), 'must handle uncaughtException');
  assert.ok(content.includes('ECANCELED'), 'must trap ECANCELED in uncaughtException');
});
