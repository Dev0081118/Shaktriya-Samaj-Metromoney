import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { SESSION_COOKIE_NAME } from '../utils/sessionCookie.js';

let io = null;
const roomForUser = (id) => `user:${String(id)}`;

const allowedOrigins = () => {
  const origins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',').map((value) => value.trim()).filter(Boolean);
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:5173', 'http://127.0.0.1:5173');
  }
  return [...new Set(origins)];
};

const tokenFromCookie = (header) => {
  if (typeof header !== 'string') return null;
  const entry = header.split(';').map((item) => item.trim())
    .find((item) => item.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!entry) return null;
  try { return decodeURIComponent(entry.slice(SESSION_COOKIE_NAME.length + 1)); }
  catch { return null; }
};

export async function authorizeRealtimeConnection(socket) {
  const header = socket.handshake.headers.cookie;
  // Cookie-only browser auth. Do not accept user ids or tokens in socket query params.
  const token = tokenFromCookie(header);
  if (!token) throw new Error('Authentication required.');
  let claims;
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    throw new Error('Session invalid or expired.');
  }
  if (!claims.sub) throw new Error('Invalid session.');
  const user = await User.findById(claims.sub).select('_id status tokenVersion');
  if (!user || user.status !== 'Active' ||
      Number(claims.ver ?? 0) !== Number(user.tokenVersion ?? 0)) {
    throw new Error('Session no longer valid.');
  }
  return String(user._id);
}

export function attachRealtimeServer(httpServer) {
  if (io) throw new Error('Realtime server has already been initialized.');
  io = new Server(httpServer, {
    path: '/socket.io',
    cors: { origin: allowedOrigins(), credentials: true, methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling']
  });
  io.use(async (socket, next) => {
    try {
      socket.data.userId = await authorizeRealtimeConnection(socket);
      next();
    } catch (error) {
      next(new Error(error.message || 'Unauthorized.'));
    }
  });
  io.on('connection', (socket) => {
    socket.join(roomForUser(socket.data.userId));
    socket.emit('realtime:ready', { connected: true });
  });
  return io;
}

// Emit identifiers and minimal metadata only. Clients re-fetch protected API data.
export function publishUserEvent(userId, event, payload = {}) {
  if (!io || !userId) return false;
  if (!/^(notification:new|notification:read|profile:status|interest:updated|match:updated)$/.test(event)) {
    throw new Error('Unsupported realtime event.');
  }
  io.to(roomForUser(userId)).emit(event, payload);
  return true;
}

export async function stopRealtimeServer() {
  if (!io) return;
  const server = io;
  io = null;
  await new Promise((resolve) => server.close(resolve));
}
