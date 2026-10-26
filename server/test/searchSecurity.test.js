import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const adminControllerSrc = fs.readFileSync(
  new URL('../src/controllers/adminController.js', import.meta.url),
  'utf8'
);

const profileControllerSrc = fs.readFileSync(
  new URL('../src/controllers/profileController.js', import.meta.url),
  'utf8'
);

const escapedRegex = (value) =>
  new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

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
  // ReDoS attack string does not match and does not hang
  const start = Date.now();
  assert.equal(rx.test('aaaaaaaaaaaaaaaaaaaaaaaaaaaa!'), false);
  assert.ok(Date.now() - start < 50);
});

test('adminController validates member status against schema enums', () => {
  assert.match(
    adminControllerSrc,
    /const allowedStatuses\s*=\s*\[\s*'Active',\s*'Suspended',\s*'Blocked',\s*'Deleted'\s*\]/
  );
  assert.match(
    adminControllerSrc,
    /!allowedStatuses\.includes\(\s*req\.query\.status\s*\)/
  );
  assert.match(
    adminControllerSrc,
    /throw new ApiError\(\s*400,\s*'Invalid status filter\.'\s*\)/
  );
});

test('adminController validates user role against schema enums', () => {
  assert.match(
    adminControllerSrc,
    /const allowedRoles\s*=\s*\[\s*'member',\s*'admin',\s*'moderator',\s*'relationship_manager',\s*'super_admin'\s*\]/
  );
  assert.match(
    adminControllerSrc,
    /!allowedRoles\.includes\(\s*req\.query\.role\s*\)/
  );
  assert.match(
    adminControllerSrc,
    /throw new ApiError\(\s*400,\s*'Invalid role filter\.'\s*\)/
  );
});

test('adminController bounds search query string length to 100 chars', () => {
  assert.match(
    adminControllerSrc,
    /searchStr\.length >\s*100/
  );
  assert.match(
    adminControllerSrc,
    /throw new ApiError\(\s*400,\s*'Search query must not exceed 100 characters\.'\s*\)/
  );
});

test('adminController global search bounds query string length to 100 chars', () => {
  assert.match(
    adminControllerSrc,
    /q\.length >\s*100/
  );
});

test('profileController bounds search and textFilter query length to 100 chars', () => {
  assert.match(
    profileControllerSrc,
    /searchStr\.length >\s*100/
  );
  assert.match(
    profileControllerSrc,
    /filterStr\.length >\s*100/
  );
  assert.match(
    profileControllerSrc,
    /Filter for \$\{param\} must not exceed 100 characters\./
  );
});
