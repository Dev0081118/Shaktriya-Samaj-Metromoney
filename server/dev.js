import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, 'src');
const serverFile = path.resolve(__dirname, 'server.js');

function hashFile(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch {
    return null;
  }
}

function scanHashes(dir, map = {}) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'uploads', 'dist', 'test'].includes(entry.name)) {
          scanHashes(full, map);
        }
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        map[full] = hashFile(full);
      }
    }
  } catch {
    /* ignore unreadable directories */
  }
  return map;
}

const fileHashes = scanHashes(srcDir);
fileHashes[serverFile] = hashFile(serverFile);

let child = null;
let restartTimer = null;
let isShuttingDown = false;

function startServer() {
  if (child) return;
  child = spawn(process.execPath, ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  child.on('exit', () => {
    child = null;
  });
}

function requestRestart(changedFile) {
  if (isShuttingDown) return;
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    const rel = path.relative(__dirname, changedFile);
    console.log(`\n🔄 [dev] Change detected in ${rel}. Reloading server...`);
    if (child) {
      child.once('exit', () => {
        child = null;
        startServer();
      });
      child.kill('SIGTERM');
      // Failsafe: if child doesn't exit in 2s, force kill
      setTimeout(() => {
        if (child) {
          try {
            child.kill('SIGKILL');
          } catch {
            /* ignore termination error */
          }
          child = null;
          startServer();
        }
      }, 2000).unref();
    } else {
      startServer();
    }
  }, 400);
}

// Watch src recursively
fs.watch(srcDir, { recursive: true }, (_event, filename) => {
  if (!filename || !filename.endsWith('.js')) return;
  const fullPath = path.resolve(srcDir, filename);
  const currentHash = hashFile(fullPath);
  if (!currentHash) return; // File deleted or unreadable

  // ONLY restart if actual file CONTENT changed!
  // This completely ignores macOS atime, ctime, and metadata touches!
  if (fileHashes[fullPath] !== currentHash) {
    fileHashes[fullPath] = currentHash;
    requestRestart(fullPath);
  }
});

// Watch server.js
fs.watch(serverFile, () => {
  const currentHash = hashFile(serverFile);
  if (currentHash && fileHashes[serverFile] !== currentHash) {
    fileHashes[serverFile] = currentHash;
    requestRestart(serverFile);
  }
});

process.on('SIGINT', () => {
  isShuttingDown = true;
  clearTimeout(restartTimer);
  if (child) {
    child.kill('SIGINT');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  isShuttingDown = true;
  clearTimeout(restartTimer);
  if (child) {
    child.kill('SIGTERM');
  }
  process.exit(0);
});

startServer();
