import 'dotenv/config';
import { createServer } from 'node:http';
import app from './src/app.js';
import { connectDatabase, disconnectDatabase } from './src/config/database.js';
import { validateProductionConfig } from './src/services/systemService.js';
import { attachRealtimeServer, stopRealtimeServer } from './src/realtime/socketServer.js';

const bootStartTime = performance.now();
const port = process.env.PORT || 3001;

console.log('🚀 Starting KSM API server...');
validateProductionConfig();

let httpServer = null;
let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  // Unref'd safety timer: if anything hangs, forcibly terminate after 5s
  const forceExitTimer = setTimeout(() => {
    console.error('⚠️ Forcefully terminating process after 5s shutdown timeout.');
    process.exit(1);
  }, 5000);
  forceExitTimer.unref();

  try {
    if (httpServer) {
      if (typeof httpServer.closeIdleConnections === 'function') {
        httpServer.closeIdleConnections();
      }
      await new Promise((resolve) => httpServer.close(resolve));
      console.log('🔌 HTTP server closed to new connections.');
    }

    await stopRealtimeServer();
    console.log('⚡ Realtime WebSockets closed.');

    await disconnectDatabase();
    console.log('📦 Database connection closed cleanly.');

    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error.message);
    process.exit(1);
  }
}

process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.once('SIGINT', () => gracefulShutdown('SIGINT'));
// Nodemon dev reload: release port 3001 immediately so the next worker never collides
process.once('SIGUSR2', () => {
  if (httpServer) {
    try {
      if (typeof httpServer.closeIdleConnections === 'function') {
        httpServer.closeIdleConnections();
      }
    } catch {
      /* ignore socket flush errors during fast reload */
    }
    try {
      httpServer.close();
    } catch {
      /* ignore close errors during fast reload */
    }
  }
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  console.error('❌ Unhandled Rejection:', message);
});

process.on('uncaughtException', (error) => {
  if (error.code === 'ECANCELED') {
    // Process received an interruption during file I/O. Exit cleanly without crashing terminal.
    process.exit(0);
  }
  console.error('💥 Uncaught Exception:', error.message);
  gracefulShutdown('uncaughtException');
});

connectDatabase()
  .then(() => {
    console.log('📦 Connected to MongoDB');
    httpServer = createServer(app);
    attachRealtimeServer(httpServer);

    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Error: Port ${port} is already in use by another running process.`);
        console.error(`👉 To free port ${port}, run: npm run free-port (or: lsof -ti :${port} | xargs kill -9)\n`);
        process.exit(1);
      }
      console.error('Server error:', error.message);
      process.exit(1);
    });

    httpServer.listen(port, () => {
      const elapsed = Math.round(performance.now() - bootStartTime);
      console.log(`✨ KSM API listening on http://localhost:${port} (ready in ${elapsed}ms)`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });
