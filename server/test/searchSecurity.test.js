import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import mongoose from 'mongoose';
import * as adminController from '../src/controllers/adminController.js';

const adminControllerSrc = fs.readFileSync(
  new URL('../src/controllers/adminController.js', import.meta.url),
  'utf8'
);

const profileControllerSrc = fs.readFileSync(
  new URL('../src/controllers/profileController.js', import.meta.url),
  'utf8'
);

const routesSrc = fs.readFileSync(
  new URL('../src/routes/index.js', import.meta.url),
  'utf8'
);

const escapedRegex = (value) =>
  new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

/**
 * Helper to invoke Express asyncHandler controller and capture next(error) or res.ok.
 */
function invokeController(controllerFn, req) {
  return new Promise((resolve) => {
    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({ status: this.statusCode || 200, payload });
      }
    };
    controllerFn(req, res, (err) => {
      if (err) {
        resolve({
          status: err.statusCode || err.status || 500,
          error: err,
          message: err.message
        });
      } else {
        resolve({ status: 200 });
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Unit Regex Neutrality Tests                                                */
/* -------------------------------------------------------------------------- */

test('escapedRegex neutralizes all standard regex metacharacters', () => {
  const metachars = '.*+?^${}()|[]\\';
  const rx = escapedRegex(metachars);
  assert.equal(rx.test(metachars), true);
  assert.equal(rx.test('abc.*+?^${}()|[]\\xyz'), true);
  // Must NOT match arbitrary characters that would have matched unescaped '.'
  assert.equal(rx.test('a'.repeat(metachars.length)), false);
});

test('escapedRegex treats ReDoS polynomial patterns as literal text', () => {
  const evilPattern = '((a+)+)+$';
  const rx = escapedRegex(evilPattern);
  // Literal match works
  assert.equal(rx.test('prefix ((a+)+)+$ suffix'), true);
  // ReDoS attack string does not match and executes under 50ms without hanging
  const start = Date.now();
  assert.equal(rx.test('aaaaaaaaaaaaaaaaaaaaaaaaaaaa!'), false);
  assert.ok(Date.now() - start < 50);
});

test('escapedRegex treats email plus-addressing literally', () => {
  const input = 'user+tag@domain.com';
  const rx = escapedRegex(input);
  assert.equal(rx.test('user+tag@domain.com'), true);
  // An unescaped '+' would match 'usertag@domain.com'
  assert.equal(rx.test('usertag@domain.com'), false);
});

/* -------------------------------------------------------------------------- */
/* Behavioral Controller Validation Tests (P1)                                */
/* -------------------------------------------------------------------------- */

test('adminController.customers rejects invalid status filter with HTTP 400', async () => {
  const invalidStatuses = ['Hacked', 'Pending', 'invalid', '123'];
  for (const status of invalidStatuses) {
    const result = await invokeController(adminController.customers, {
      query: { status },
      user: { role: 'admin' }
    });
    assert.equal(result.status, 400, `Expected 400 for status "${status}"`);
    assert.match(result.message, /Invalid status filter/);
  }
});

test('adminController.customers rejects object/array injection in status with HTTP 400', async () => {
  // MongoDB operator injection via query string object (e.g. status[$ne]=Active)
  const injectionAttempts = [
    { $ne: 'Active' },
    { $gt: '' },
    ['Active', 'Blocked'],
    { $exists: true }
  ];

  for (const status of injectionAttempts) {
    const result = await invokeController(adminController.customers, {
      query: { status },
      user: { role: 'admin' }
    });
    assert.equal(result.status, 400, 'Expected 400 for object/array status injection');
    assert.match(result.message, /Invalid status filter/);
  }
});

test('adminController.customers rejects search strings exceeding 100 characters with HTTP 400', async () => {
  const longSearch = 'a'.repeat(101);
  const result = await invokeController(adminController.customers, {
    query: { search: longSearch },
    user: { role: 'admin' }
  });
  assert.equal(result.status, 400);
  assert.match(result.message, /Search query must not exceed 100 characters/);
});

test('adminController.users rejects invalid role filter with HTTP 400', async () => {
  const invalidRoles = ['superadmin', 'root', 'user', 'guest', 'invalid_role'];
  for (const role of invalidRoles) {
    const result = await invokeController(adminController.users, {
      query: { role },
      user: { role: 'admin' }
    });
    assert.equal(result.status, 400, `Expected 400 for role "${role}"`);
    assert.match(result.message, /Invalid role filter/);
  }
});

test('adminController.users rejects object/array injection in role with HTTP 400', async () => {
  const injectionAttempts = [
    { $ne: null },
    ['admin', 'member'],
    { $regex: '.*' }
  ];

  for (const role of injectionAttempts) {
    const result = await invokeController(adminController.users, {
      query: { role },
      user: { role: 'admin' }
    });
    assert.equal(result.status, 400, 'Expected 400 for object/array role injection');
    assert.match(result.message, /Invalid role filter/);
  }
});

test('adminController.users rejects search strings exceeding 100 characters with HTTP 400', async () => {
  const longSearch = 'test'.repeat(30); // 120 chars
  const result = await invokeController(adminController.users, {
    query: { search: longSearch },
    user: { role: 'admin' }
  });
  assert.equal(result.status, 400);
  assert.match(result.message, /Search query must not exceed 100 characters/);
});

test('adminController.search rejects query exceeding 100 characters with HTTP 400', async () => {
  const longQuery = 'b'.repeat(101);
  const result = await invokeController(adminController.search, {
    query: { q: longQuery },
    user: { role: 'admin' }
  });
  assert.equal(result.status, 400);
  assert.match(result.message, /Search query must not exceed 100 characters/);
});

test('adminController.search returns empty result lists when q is under 2 characters without error', async () => {
  const result = await invokeController(adminController.search, {
    query: { q: 'a' },
    user: { role: 'admin' }
  });
  assert.equal(result.status, 200);
  assert.deepEqual(result.payload.data, {
    customers: [],
    profiles: [],
    payments: [],
    supportTickets: []
  });
});

/* -------------------------------------------------------------------------- */
/* Route Guard & Authorization Contract Tests (P1)                            */
/* -------------------------------------------------------------------------- */

test('admin routes enforce authentication and administrator authorization', () => {
  // Verify protect and adminOnly are configured on administrative search endpoints
  assert.match(
    routesSrc,
    /const adminOnly\s*=\s*permit\(\s*['"]admin['"],\s*['"]super_admin['"]\s*\);/
  );
  assert.match(
    routesSrc,
    /router\s*\.\s*get\(\s*['"]\/admin\/customers['"]\s*,\s*protect\s*,\s*adminOnly\s*,\s*admin\.customers\s*\);/
  );
  assert.match(
    routesSrc,
    /router\s*\.\s*get\(\s*['"]\/admin\/search['"]\s*,\s*protect\s*,\s*adminOnly\s*,\s*admin\.search\s*\);/
  );
  assert.match(
    routesSrc,
    /router\s*\.\s*get\(\s*['"]\/admin\/users['"]\s*,\s*protect\s*,\s*adminOnly\s*,\s*admin\.users\s*\);/
  );
});

test('source invariants: adminController enforces bounded schema enums and lengths', () => {
  assert.match(
    adminControllerSrc,
    /const allowedStatuses\s*=\s*\[\s*'Active',\s*'Suspended',\s*'Blocked',\s*'Deleted'\s*\]/
  );
  assert.match(
    adminControllerSrc,
    /const allowedRoles\s*=\s*\[\s*'member',\s*'admin',\s*'moderator',\s*'relationship_manager',\s*'super_admin'\s*\]/
  );
  assert.match(
    profileControllerSrc,
    /searchStr\.length >\s*100/
  );
  assert.match(
    profileControllerSrc,
    /filterStr\.length >\s*100/
  );
});

after(async () => {
  await mongoose.disconnect();
});
