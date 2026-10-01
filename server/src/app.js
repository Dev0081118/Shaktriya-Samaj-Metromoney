import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import routes from './routes/index.js';
import { razorpayWebhook } from './controllers/membershipController.js';
import { ApiError } from './utils/http.js';
import { providerDiagnostics } from './services/systemService.js';
const app = express(),
  configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((x) => x.trim());
if (process.env.NODE_ENV !== 'production')
  configuredOrigins.push('http://127.0.0.1:5173');
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, callback) =>
      !origin || configuredOrigins.includes(origin)
        ? callback(null, true)
        : callback(new ApiError(403, 'Origin is not allowed.')),
    credentials: false
  })
);
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
});
if (process.env.NODE_ENV !== 'test')
  app.use(
    morgan((tokens, req, res) =>
      JSON.stringify({
        event: 'http_request',
        requestId: req.id,
        method: tokens.method(req, res),
        path: tokens.url(req, res),
        status: Number(tokens.status(req, res)),
        responseMs: Number(tokens['response-time'](req, res))
      })
    )
  );
app.post(
  '/api/webhooks/razorpay',
  express.raw({ type: 'application/json', limit: '256kb' }),
  razorpayWebhook
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/uploads', express.static('uploads'));
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false
  }),
  otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false
  });
app.use(
  [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password'
  ],
  authLimiter
);
app.use(['/api/auth/send-otp', '/api/auth/verify-otp'], otpLimiter);
app.get('/api/health', (_q, r) =>
  r.json({
    success: true,
    message: 'API is healthy.',
    data: { environment: process.env.NODE_ENV || 'development' }
  })
);
app.get('/api/ready', (_q, r) => {
  const database = mongoose.connection.readyState === 1,
    providers = providerDiagnostics(),
    providerState = Object.fromEntries(
      Object.entries(providers).map(([key, value]) => [
        key,
        { name: value.name, configured: value.configured }
      ])
    ),
    ready =
      database &&
      (process.env.NODE_ENV !== 'production' ||
        Object.values(providers).every((provider) => provider.configured));
  r.status(ready ? 200 : 503).json({
    success: ready,
    message: ready ? 'API is ready.' : 'A required dependency is not ready.',
    data: {
      database: database ? 'connected' : 'unavailable',
      providers: providerState
    }
  });
});
app.use('/api', routes);
app.use((_q, _r, next) => next(new ApiError(404, 'Route not found.')));
app.use((error, req, res, _next) => {
  const status =
    error.status ||
    (error.name === 'ValidationError' || error.name === 'CastError'
      ? 400
      : 500);
  if (error.code === 11000)
    return res.status(409).json({
      success: false,
      message: 'A record with these details already exists.',
      errors: [],
      requestId: req.id
    });
  if (status === 500)
    console.error({
      event: 'request_error',
      requestId: req.id,
      route: req.originalUrl,
      status,
      error: error.message
    });
  res.status(status).json({
    success: false,
    message:
      status === 500 ? 'An unexpected server error occurred.' : error.message,
    errors: error.errors || [],
    requestId: req.id
  });
});
export default app;
