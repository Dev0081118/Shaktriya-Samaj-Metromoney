import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import crypto from 'node:crypto';

import routes from './routes/index.js';

import {
  razorpayWebhook
} from './controllers/membershipController.js';

import {
  ApiError
} from './utils/http.js';

import {
  providerDiagnostics
} from './services/systemService.js';

const app =
  express();

const isProduction =
  process.env.NODE_ENV ===
  'production';

const isTest =
  process.env.NODE_ENV ===
  'test';

/*
 * Frontend origins allowed to call the API.
 *
 * Multiple URLs can be supplied:
 *
 * CLIENT_URL=https://example.com,https://www.example.com
 */
const configuredOrigins =
  (
    process.env.CLIENT_URL ||
    'http://localhost:5173'
  )
    .split(',')
    .map(
      (
        value
      ) =>
        value.trim()
    )
    .filter(
      Boolean
    );

if (
  !isProduction
) {
  for (
    const origin
    of [
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ]
  ) {
    if (
      !configuredOrigins.includes(
        origin
      )
    ) {
      configuredOrigins.push(
        origin
      );
    }
  }
}

/*
 * Do not disclose Express.
 */
app.disable(
  'x-powered-by'
);

/*
 * Reverse-proxy handling.
 *
 * Production deployments normally sit behind
 * Render / Railway / Nginx / another HTTPS proxy.
 *
 * Local development does not need proxy trust.
 */
app.set(
  'trust proxy',
  isProduction
    ? 1
    : false
);

/*
 * Security headers.
 *
 * This process primarily serves a JSON API rather
 * than the React frontend, therefore the safest CSP
 * is intentionally strict.
 *
 * The React/Vite deployment should define its own
 * browser-facing CSP separately.
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [
          "'none'"
        ],

        baseUri: [
          "'none'"
        ],

        frameAncestors: [
          "'none'"
        ],

        formAction: [
          "'none'"
        ]
      }
    },

    crossOriginEmbedderPolicy:
      false,

    /*
     * Development may still serve /uploads to a
     * frontend running on port 5173.
     *
     * Production photos use authenticated
     * Cloudinary delivery.
     */
    crossOriginResourcePolicy: {
      policy:
        'cross-origin'
    },

    referrerPolicy: {
      policy:
        'no-referrer'
    },

    frameguard: {
      action:
        'deny'
    },

    noSniff:
      true,

    hsts:
      isProduction
        ? {
            maxAge:
              31536000,

            includeSubDomains:
              true,

            preload:
              false
          }
        : false
  })
);

/*
 * Explicit Permissions Policy.
 *
 * The backend API never needs direct access to
 * browser sensors/devices.
 */
app.use(
  (
    _req,
    res,
    next
  ) => {
    res.setHeader(
      'Permissions-Policy',
      [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()'
      ].join(
        ', '
      )
    );

    next();
  }
);

/*
 * CORS.
 *
 * Requests with no Origin header are still allowed
 * because server-to-server calls, webhooks and
 * testing tools commonly omit Origin.
 */
app.use(
  cors({
    origin: (
      origin,
      callback
    ) => {
      if (
        !origin
      ) {
        return callback(
          null,
          true
        );
      }

      if (
        configuredOrigins.includes(
          origin
        )
      ) {
        return callback(
          null,
          true
        );
      }

      return callback(
        new ApiError(
          403,
          'Origin is not allowed.'
        )
      );
    },

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'X-Request-Id'
    ],

    exposedHeaders: [
      'X-Request-Id',
      'RateLimit-Limit',
      'RateLimit-Remaining',
      'RateLimit-Reset'
    ],

    credentials:
      false,

    maxAge:
      86400
  })
);

/*
 * Request correlation ID.
 *
 * Avoid trusting arbitrarily long values supplied
 * by external clients.
 */
app.use(
  (
    req,
    res,
    next
  ) => {
    const supplied =
      req.headers[
        'x-request-id'
      ];

    const validSuppliedId =
      typeof supplied ===
        'string' &&
      supplied.length <=
        128 &&
      /^[a-zA-Z0-9._:-]+$/.test(
        supplied
      );

    req.id =
      validSuppliedId
        ? supplied
        : crypto.randomUUID();

    res.setHeader(
      'X-Request-Id',
      req.id
    );

    next();
  }
);

/*
 * Structured HTTP logging.
 *
 * Avoid logging Authorization headers, request
 * bodies, cookies or other secrets.
 */
if (
  !isTest
) {
  app.use(
    morgan(
      (
        tokens,
        req,
        res
      ) =>
        JSON.stringify({
          event:
            'http_request',

          requestId:
            req.id,

          method:
            tokens.method(
              req,
              res
            ),

          path:
            tokens.url(
              req,
              res
            ),

          status:
            Number(
              tokens.status(
                req,
                res
              )
            ),

          responseMs:
            Number(
              tokens[
                'response-time'
              ](
                req,
                res
              )
            )
        })
    )
  );
}

/*
 * Razorpay webhook MUST receive the exact raw body
 * used for Razorpay's HMAC signature.
 *
 * Keep this route BEFORE express.json().
 */
app.post(
  '/api/webhooks/razorpay',

  express.raw({
    type:
      'application/json',

    limit:
      '256kb'
  }),

  razorpayWebhook
);

/*
 * Normal API body parsing.
 *
 * Keep payload limits deliberately small.
 * Images are handled separately through Multer.
 */
app.use(
  express.json({
    limit:
      '1mb',

    strict:
      true
  })
);

app.use(
  express.urlencoded({
    extended:
      true,

    limit:
      '1mb',

    parameterLimit:
      100
  })
);

/*
 * Local media fallback.
 *
 * Production uses authenticated Cloudinary assets,
 * therefore this should mainly be useful during
 * local development.
 */
app.use(
  '/uploads',
  express.static(
    'uploads',
    {
      fallthrough:
        true,

      index:
        false,

      dotfiles:
        'deny',

      maxAge:
        isProduction
          ? '1d'
          : 0
    }
  )
);

/*
 * Authentication brute-force protection.
 */
const authLimiter =
  rateLimit({
    windowMs:
      15 *
      60 *
      1000,

    limit:
      30,

    standardHeaders:
      'draft-7',

    legacyHeaders:
      false,

    skipSuccessfulRequests:
      false,

    message: {
      success:
        false,

      message:
        'Too many authentication attempts. Please try again later.'
    }
  });

/*
 * OTP endpoints get a stricter limiter because
 * they may trigger an external SMS provider.
 */
const otpLimiter =
  rateLimit({
    windowMs:
      15 *
      60 *
      1000,

    limit:
      8,

    standardHeaders:
      'draft-7',

    legacyHeaders:
      false,

    message: {
      success:
        false,

      message:
        'Too many verification attempts. Please try again later.'
    }
  });

const supportLimiter =
  rateLimit({
    windowMs:
      60 *
      60 *
      1000,

    limit:
      10,

    standardHeaders:
      'draft-7',

    legacyHeaders:
      false,

    message: {
      success:
        false,

      message:
        'Too many support requests. Please try again later.'
    }
  });

const paymentLimiter =
  rateLimit({
    windowMs:
      15 *
      60 *
      1000,

    limit:
      20,

    standardHeaders:
      'draft-7',

    legacyHeaders:
      false,

    message: {
      success:
        false,

      message:
        'Too many payment requests. Please try again shortly.'
    }
  });

/*
 * Lightweight safety net for the whole API.
 *
 * Endpoint-specific limiters above/below remain
 * stricter where necessary.
 *
 * This limit is intentionally generous so normal
 * member dashboard/discovery usage is unaffected.
 */
const apiLimiter =
  rateLimit({
    windowMs:
      15 *
      60 *
      1000,

    limit:
      isProduction
        ? 600
        : 5000,

    standardHeaders:
      'draft-7',

    legacyHeaders:
      false,

    message: {
      success:
        false,

      message:
        'Too many requests. Please try again shortly.'
    }
  });

app.use(
  '/api',
  apiLimiter
);

app.use(
  [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/change-password'
  ],
  authLimiter
);

app.use(
  [
    '/api/auth/send-otp',
    '/api/auth/verify-otp'
  ],
  otpLimiter
);

app.use(
  '/api/support',
  supportLimiter
);

app.use(
  [
    '/api/payments/orders',
    '/api/payments/verify'
  ],
  paymentLimiter
);

/*
 * Liveness probe.
 *
 * Does not expose secrets or database details.
 */
app.get(
  '/api/health',
  (
    _req,
    res
  ) =>
    res.json({
      success:
        true,

      message:
        'API is healthy.',

      data: {
        environment:
          process.env.NODE_ENV ||
          'development'
      }
    })
);

/*
 * Readiness probe.
 *
 * Only exposes provider name/configured state,
 * never credentials or missing secret values.
 */
app.get(
  '/api/ready',
  (
    _req,
    res
  ) => {
    const database =
      mongoose.connection
        .readyState ===
      1;

    const providers =
      providerDiagnostics();

    const providerState =
      Object.fromEntries(
        Object.entries(
          providers
        ).map(
          ([
            key,
            value
          ]) => [
            key,
            {
              name:
                value.name,

              configured:
                value.configured
            }
          ]
        )
      );

    const ready =
      database &&
      (
        !isProduction ||
        Object.values(
          providers
        ).every(
          (
            provider
          ) =>
            provider.configured
        )
      );

    res
      .status(
        ready
          ? 200
          : 503
      )
      .json({
        success:
          ready,

        message:
          ready
            ? 'API is ready.'
            : 'A required dependency is not ready.',

        data: {
          database:
            database
              ? 'connected'
              : 'unavailable',

          providers:
            providerState
        }
      });
  }
);

app.use(
  '/api',
  routes
);

/*
 * Unknown route.
 */
app.use(
  (
    _req,
    _res,
    next
  ) =>
    next(
      new ApiError(
        404,
        'Route not found.'
      )
    )
);

/*
 * Central error handler.
 *
 * Production responses never expose stack traces,
 * MongoDB internals or provider errors.
 */
app.use(
  (
    error,
    req,
    res,
    _next
  ) => {
    const status =
      error.status ||
      (
        error.name ===
          'ValidationError' ||
        error.name ===
          'CastError'
          ? 400
          : 500
      );

    if (
      error.code ===
      11000
    ) {
      return res
        .status(
          409
        )
        .json({
          success:
            false,

          message:
            'A record with these details already exists.',

          errors:
            [],

          requestId:
            req.id
        });
    }

    if (
      status >=
      500
    ) {
      console.error({
        event:
          'request_error',

        requestId:
          req.id,

        route:
          req.originalUrl,

        status,

        error:
          error.message
      });
    }

    res
      .status(
        status
      )
      .json({
        success:
          false,

        ...(
          error.apiCode
            ? {
                code:
                  error.apiCode
              }
            : {}
        ),

        message:
          status >=
          500
            ? 'An unexpected server error occurred.'
            : error.message,

        errors:
          error.errors ||
          [],

        requestId:
          req.id
      });
  }
);

export default app;