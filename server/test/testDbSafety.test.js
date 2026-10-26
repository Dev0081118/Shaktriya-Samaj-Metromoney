import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertSafeDatabaseName,
  assertSafeTestUri,
  extractDatabaseName,
  redactMongoUri,
  safeCleanupDatabase
} from './testDbSafety.js';

test('redactMongoUri masks user passwords and tokens', () => {
  const uri = 'mongodb://app_user:super_secret_password123@127.0.0.1:27017/ksm_test';
  const redacted = redactMongoUri(uri);
  assert.equal(redacted.includes('super_secret_password123'), false);
  assert.equal(redacted.includes('app_user'), false);
  assert.equal(redacted.includes('[REDACTED_CREDENTIALS]'), true);
  assert.equal(redacted.includes('ksm_test'), true);
});

test('extractDatabaseName extracts correct database name across URI formats', () => {
  assert.equal(
    extractDatabaseName('mongodb://127.0.0.1:27017/ksm_test_isolated'),
    'ksm_test_isolated'
  );
  assert.equal(
    extractDatabaseName('mongodb://127.0.0.1:27017/ksm_test_isolated?authSource=admin'),
    'ksm_test_isolated'
  );
  assert.equal(
    extractDatabaseName('mongodb+srv://user:pass@cluster0.mongodb.net/staging_test?retryWrites=true'),
    'staging_test'
  );
});

test('assertSafeDatabaseName accepts valid test database names', () => {
  assert.equal(assertSafeDatabaseName('ksm_test_isolated'), true);
  assert.equal(assertSafeDatabaseName('test_db'), true);
  assert.equal(assertSafeDatabaseName('matrimony_test_ci'), true);
  assert.equal(assertSafeDatabaseName('ksm_test_mem_1729958400000'), true);
});

test('assertSafeDatabaseName rejects production and system database names', () => {
  const forbiddenNames = [
    'admin',
    'config',
    'local',
    'production',
    'prod',
    'ksm_production',
    'ksm_prod',
    'kshatriya_matrimonial',
    'shaktriya_samaj',
    'matrimony',
    'live',
    'main',
    'master'
  ];

  for (const name of forbiddenNames) {
    assert.throws(
      () => assertSafeDatabaseName(name),
      /Database safety violation/,
      `Expected "${name}" to be rejected by safety guard.`
    );
  }
});

test('assertSafeDatabaseName rejects database names lacking "test"', () => {
  const nonTestNames = ['ksm', 'matrimonial_data', 'custom_db', 'app'];

  for (const name of nonTestNames) {
    assert.throws(
      () => assertSafeDatabaseName(name),
      /Database safety violation: Database name .* does not satisfy the test naming policy/,
      `Expected non-test name "${name}" to be rejected.`
    );
  }
});

test('assertSafeTestUri validates full URIs and rejects production targets', () => {
  assert.throws(
    () => assertSafeTestUri('mongodb://127.0.0.1:27017/ksm_production'),
    /Database safety violation/
  );
  assert.throws(
    () => assertSafeTestUri('mongodb+srv://admin:pass@cluster.mongodb.net/kshatriya_matrimonial'),
    /Database safety violation/
  );
  assert.throws(
    () => assertSafeTestUri('mongodb://127.0.0.1:27017/'),
    /Database safety violation/
  );

  assert.equal(
    assertSafeTestUri('mongodb://127.0.0.1:27017/ksm_test_isolated'),
    'ksm_test_isolated'
  );
});

test('safeCleanupDatabase refuses to delete collections if active connection is unsafe', async () => {
  const fakeUnsafeMongoose = {
    connection: {
      readyState: 1,
      name: 'ksm_production',
      collections: {
        users: {
          deleteMany: async () => {
            throw new Error('Should NEVER be called!');
          }
        }
      }
    }
  };

  await assert.rejects(
    () => safeCleanupDatabase(fakeUnsafeMongoose),
    /Database safety violation/,
    'Expected safeCleanupDatabase to refuse deletion on production DB.'
  );
});
