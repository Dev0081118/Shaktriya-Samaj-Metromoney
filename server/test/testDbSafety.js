import fs from 'node:fs';

if (!process.env.MONGOMS_SYSTEM_BINARY) {
  if (fs.existsSync('/opt/homebrew/bin/mongod')) {
    process.env.MONGOMS_SYSTEM_BINARY = '/opt/homebrew/bin/mongod';
  } else if (fs.existsSync('/usr/local/bin/mongod')) {
    process.env.MONGOMS_SYSTEM_BINARY = '/usr/local/bin/mongod';
  }
}

/**
 * Known system, default, or production-sensitive database names/patterns
 * that must NEVER be touched by any test execution.
 */
const FORBIDDEN_EXACT_NAMES = new Set([
  '',
  'admin',
  'config',
  'local',
  'main',
  'master',
  'production',
  'prod',
  'live',
  'release',
  'staging',
  'demo',
  'kshatriya_matrimonial',
  'shaktriya_samaj',
  'ksm_production',
  'ksm_main',
  'ksm_prod',
  'matrimony'
]);

const FORBIDDEN_SUBSTRINGS = [
  'prod',
  'production',
  'live',
  'master',
  'release'
];

/**
 * Allowed hostnames/IPs for test execution.
 * Connections must be strictly restricted to local loopback or in-memory MongoDB.
 */
export const ALLOWED_LOOPBACK_HOSTS = new Set([
  '127.0.0.1',
  'localhost',
  '::1',
  '[::1]'
]);

/**
 * Mask credentials from any MongoDB connection string for safe error reporting.
 * Never leaks passwords or auth tokens in logs or errors.
 */
export function redactMongoUri(uri) {
  if (typeof uri !== 'string') return '<invalid-uri>';
  return uri.replace(
    /(mongodb(?:\+srv)?:\/\/)(?:[^:]+:[^@]+@|[^@]+@)/,
    '$1[REDACTED_CREDENTIALS]@'
  );
}

/**
 * Extract and normalize host list from a MongoDB URI.
 * Rejects mongodb+srv:// immediately because SRV resolves remote DNS records.
 */
export function extractHosts(uri) {
  if (typeof uri !== 'string' || !uri.trim()) {
    throw new Error('Database safety violation: MongoDB URI is missing or empty.');
  }

  const trimmed = uri.trim();

  if (trimmed.startsWith('mongodb+srv://')) {
    throw new Error(
      'Database safety violation: "mongodb+srv://" URIs are forbidden for test databases. Only local loopback connections are permitted.'
    );
  }

  if (!trimmed.startsWith('mongodb://')) {
    throw new Error('Database safety violation: Invalid MongoDB URI scheme. Must start with "mongodb://".');
  }

  const withoutScheme = trimmed.slice('mongodb://'.length);
  const hostPartMatch = withoutScheme.match(/^([^/?]+)/);
  if (!hostPartMatch || !hostPartMatch[1]) {
    throw new Error('Database safety violation: Could not extract host from MongoDB URI.');
  }

  let hostSection = hostPartMatch[1];
  if (hostSection.includes('@')) {
    hostSection = hostSection.split('@').slice(1).join('@');
  }

  if (!hostSection.trim()) {
    throw new Error('Database safety violation: No host specified in MongoDB URI.');
  }

  const entries = hostSection.split(',').map((e) => e.trim()).filter(Boolean);
  if (entries.length === 0) {
    throw new Error('Database safety violation: No valid host entries found.');
  }

  return entries.map((entry) => {
    if (entry.startsWith('[')) {
      const closingBracket = entry.indexOf(']');
      if (closingBracket !== -1) {
        return entry.slice(1, closingBracket).toLowerCase();
      }
    }
    const colonIdx = entry.lastIndexOf(':');
    const host = colonIdx !== -1 ? entry.slice(0, colonIdx) : entry;
    return host.toLowerCase();
  });
}

/**
 * Assert that all hosts targeted by the test URI are local loopback hosts.
 */
export function assertSafeHosts(uri) {
  const hosts = extractHosts(uri);
  for (const host of hosts) {
    if (!ALLOWED_LOOPBACK_HOSTS.has(host)) {
      throw new Error(
        `Database safety violation: Host "${host}" is not an allowed local loopback host. Test database connections are strictly restricted to local loopback (127.0.0.1, localhost, [::1]).`
      );
    }
  }
  return hosts;
}

/**
 * Assert that an active mongoose connection points to an allowed local loopback host.
 * Throws a descriptive Error if the connection host is remote or unsafe.
 */
export function assertSafeConnectionHost(connection) {
  if (!connection) {
    throw new Error('Database safety violation: No active database connection to validate.');
  }
  const host = connection.host;
  if (host && typeof host === 'string') {
    const normalizedHost = host.toLowerCase().trim();
    if (!ALLOWED_LOOPBACK_HOSTS.has(normalizedHost)) {
      throw new Error(
        `Database safety violation: Active connection host "${host}" is not an allowed local loopback host. Test database operations are strictly restricted to local loopback (127.0.0.1, localhost, [::1]).`
      );
    }
  }
  return true;
}

/**
 * Extract database name from a MongoDB URI string.
 */
export function extractDatabaseName(uri) {
  if (typeof uri !== 'string' || !uri.trim()) {
    throw new Error('Database safety violation: MongoDB URI is missing or empty.');
  }

  try {
    // Replace custom scheme to leverage standard URL parser
    const parsed = new URL(uri.replace(/^mongodb(\+srv)?:\/\//, 'http://'));
    const pathname = parsed.pathname ? parsed.pathname.replace(/^\//, '') : '';
    // Trim query params or trailing slashes
    const dbName = pathname.split('/')[0].split('?')[0].trim();
    return dbName;
  } catch {
    // Regex fallback parser for non-standard connection strings
    const match = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^/?]+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
    throw new Error('Database safety violation: Could not parse database name from MongoDB URI.');
  }
}

/**
 * Validate that a database name satisfies strict isolation and safety rules.
 * Throws a descriptive Error if the database name is unsafe.
 */
export function assertSafeDatabaseName(dbName) {
  if (!dbName || typeof dbName !== 'string') {
    throw new Error('Database safety violation: Test database name is missing or empty.');
  }

  const normalized = dbName.trim().toLowerCase();

  if (FORBIDDEN_EXACT_NAMES.has(normalized)) {
    throw new Error(
      `Database safety violation: Database name "${dbName}" is forbidden. Tests must not run against system or production databases.`
    );
  }

  for (const forbidden of FORBIDDEN_SUBSTRINGS) {
    if (normalized.includes(forbidden)) {
      throw new Error(
        `Database safety violation: Database name "${dbName}" contains forbidden production keyword "${forbidden}".`
      );
    }
  }

  // Positive requirement: Must explicitly contain "test"
  if (!normalized.includes('test')) {
    throw new Error(
      `Database safety violation: Database name "${dbName}" does not satisfy the test naming policy. Database name must contain "test" (e.g. "ksm_test_isolated").`
    );
  }

  return true;
}

/**
 * Validate a full MongoDB URI before connection:
 * 1. Checks host policy (fail-closed, local loopback only).
 * 2. Checks database name safety policy (must contain test, no production keywords).
 */
export function assertSafeTestUri(uri) {
  assertSafeHosts(uri);
  const dbName = extractDatabaseName(uri);
  assertSafeDatabaseName(dbName);
  return dbName;
}

/**
 * Setup test database:
 * 1. If process.env.TEST_MONGO_URI is set, validates it strictly against the safety guard.
 * 2. If valid, connects Mongoose to that isolated URI.
 * 3. If TEST_MONGO_URI is not set, spawns MongoMemoryServer.
 * 4. Returns { database, uri, dbName }.
 */
export async function setupTestDatabase(mongoose, { defaultDbPrefix = 'ksm_test' } = {}) {
  let database = null;
  let connectionUri;
  let dbName;

  const configuredUri = process.env.TEST_MONGO_URI || process.env.TESTMONGOURI;
  if (configuredUri) {
    const rawUri = configuredUri;
    try {
      dbName = assertSafeTestUri(rawUri);
    } catch (err) {
      // Never log full raw URI with credentials
      throw new Error(
        `Test aborted by safety guard: ${err.message} (Target: ${redactMongoUri(rawUri)})`,
        { cause: err }
      );
    }
    connectionUri = rawUri;
  } else {
    // In-memory MongoDB for local test isolation
    const prefix = defaultDbPrefix.includes('test')
      ? defaultDbPrefix
      : `${defaultDbPrefix}_test`;
    const targetDbName = `${prefix}_mem_${Date.now()}`;
    if (!process.env.MONGOMS_SYSTEM_BINARY) {
      const fs = await import('node:fs');
      if (fs.existsSync('/opt/homebrew/bin/mongod')) {
        process.env.MONGOMS_SYSTEM_BINARY = '/opt/homebrew/bin/mongod';
      } else if (fs.existsSync('/usr/local/bin/mongod')) {
        process.env.MONGOMS_SYSTEM_BINARY = '/usr/local/bin/mongod';
      }
    }
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    database = await MongoMemoryServer.create({
      instance: {
        ip: '127.0.0.1',
        dbName: targetDbName
      }
    });
    const baseUri = database.getUri();
    connectionUri = baseUri.endsWith('/') ? `${baseUri}${targetDbName}` : `${baseUri}/${targetDbName}`;
    try {
      dbName = assertSafeTestUri(connectionUri);
    } catch (err) {
      await database.stop();
      throw err;
    }
  }

  try {
    assertSafeTestUri(connectionUri);
    await mongoose.connect(connectionUri);

    // Double check active Mongoose connection name & host
    const activeDb = mongoose.connection.name;
    assertSafeDatabaseName(activeDb);
    assertSafeConnectionHost(mongoose.connection);
  } catch (err) {
    if (database) {
      await database.stop();
    }
    throw err;
  }

  return { database, uri: connectionUri, dbName };
}

/**
 * Safe cleanup hook for afterEach:
 * Double-checks database safety before executing any destructive operations (deleteMany).
 */
export async function safeCleanupDatabase(mongoose) {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    return;
  }

  const activeDb = mongoose.connection.name;
  assertSafeDatabaseName(activeDb);
  assertSafeConnectionHost(mongoose.connection);

  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({});
  }
}

/**
 * Safe teardown hook for after:
 */
export async function safeTeardownDatabase(mongoose, database) {
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (database && typeof database.stop === 'function') {
    await database.stop({ doCleanup: true, force: true });
  }
}
