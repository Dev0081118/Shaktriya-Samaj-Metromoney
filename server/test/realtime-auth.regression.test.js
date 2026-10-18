import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';
import { SESSION_COOKIE_NAME } from '../src/utils/sessionCookie.js';
import { authorizeRealtimeConnection, publishUserEvent } from '../src/realtime/socketServer.js';

const id = '64b123456789abcdef012345';
const secret = process.env.JWT_SECRET || 'realtime-regression-secret';
const token = (claims = {}, options = {}) => jwt.sign({ sub: id, ver: 2, ...claims }, secret, { algorithm: 'HS256', expiresIn: '15m', ...options });
const socket = (value) => ({ handshake: { headers: { cookie: value } } });

async function withUser(user, fn) {
  const previous = User.findById;
  User.findById = () => ({ select: async () => user });
  try { return await fn(); } finally { User.findById = previous; }
}

test('socket handshake rejects missing session cookie', async () => {
  await assert.rejects(authorizeRealtimeConnection(socket('')), /Authentication required/);
});

test('socket handshake refuses bearer/query-string impersonation', async () => {
  const fake = { handshake: { headers: {}, query: { userId: id, token: token() }, auth: { token: token() } } };
  await assert.rejects(authorizeRealtimeConnection(fake), /Authentication required/);
});

test('valid active session cookie authenticates the database identity', async () => {
  const original = process.env.JWT_SECRET;
  process.env.JWT_SECRET = secret;
  try {
    await withUser({ _id: id, status: 'Active', tokenVersion: 2 }, async () => {
      assert.equal(await authorizeRealtimeConnection(socket(`theme=dark; ${SESSION_COOKIE_NAME}=${encodeURIComponent(token())}`)), id);
    });
  } finally { if (original === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = original; }
});

test('revoked token version cannot connect', async () => {
  const original = process.env.JWT_SECRET;
  process.env.JWT_SECRET = secret;
  try {
    await withUser({ _id: id, status: 'Active', tokenVersion: 3 }, async () => {
      await assert.rejects(authorizeRealtimeConnection(socket(`${SESSION_COOKIE_NAME}=${token()}`)), /Session no longer valid/);
    });
  } finally { if (original === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = original; }
});

test('inactive or deleted account cannot connect', async () => {
  const original = process.env.JWT_SECRET;
  process.env.JWT_SECRET = secret;
  try {
    for (const user of [null, { _id: id, status: 'Inactive', tokenVersion: 2 }]) {
      await withUser(user, async () => {
        await assert.rejects(authorizeRealtimeConnection(socket(`${SESSION_COOKIE_NAME}=${token()}`)), /Session no longer valid/);
      });
    }
  } finally { if (original === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = original; }
});

test('invalid signature and expired token are rejected', async () => {
  const original = process.env.JWT_SECRET;
  process.env.JWT_SECRET = secret;
  try {
    const invalid = jwt.sign({ sub: id, ver: 2 }, 'another-secret');
    await assert.rejects(authorizeRealtimeConnection(socket(`${SESSION_COOKIE_NAME}=${invalid}`)), /invalid or expired/);
    await assert.rejects(authorizeRealtimeConnection(socket(`${SESSION_COOKIE_NAME}=${token({}, { expiresIn: -10 })}`)), /invalid or expired/);
  } finally { if (original === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = original; }
});

test('publishing without a running socket server is a safe no-op', () => {
  assert.equal(publishUserEvent(id, 'notification:new'), false);
  assert.equal(publishUserEvent(id, 'match:updated'), false);
});
