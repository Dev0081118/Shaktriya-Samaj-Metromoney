import jwt from 'jsonwebtoken';

import User from '../models/User.js';

import {
  ApiError,
  asyncHandler
} from '../utils/http.js';

import {
  getSystemSettings
} from '../services/systemService.js';

/*
 * Session cookie name.
 *
 * Keep this centralized because the same name
 * will be used when login/register start issuing
 * httpOnly cookies in the next step.
 */
export const SESSION_COOKIE_NAME =
  'ksm_session';

/*
 * Read one cookie without adding another package.
 *
 * We intentionally keep cookie parsing minimal
 * because we only need the session cookie here.
 */
const readCookie = (
  req,
  name
) => {
  const header =
    req.headers.cookie;

  if (
    typeof header !==
      'string' ||
    !header
  ) {
    return null;
  }

  const prefix =
    `${name}=`;

  const entry =
    header
      .split(';')
      .map(
        (value) =>
          value.trim()
      )
      .find(
        (value) =>
          value.startsWith(
            prefix
          )
      );

  if (!entry) {
    return null;
  }

  const value =
    entry.slice(
      prefix.length
    );

  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(
      value
    );
  } catch {
    return null;
  }
};

/*
 * Migration-safe token reader.
 *
 * During the cookie migration we support both:
 *
 * 1. httpOnly session cookie
 * 2. legacy Authorization Bearer token
 *
 * Cookie takes priority once present.
 *
 * After the frontend migration is complete,
 * Bearer support can be removed separately.
 */
const readToken = (
  req
) => {
  const cookieToken =
    readCookie(
      req,
      SESSION_COOKIE_NAME
    );

  if (
    cookieToken
  ) {
    return cookieToken;
  }

  const authorization =
    req.headers.authorization;

  if (
    typeof authorization ===
      'string' &&
    authorization.startsWith(
      'Bearer '
    )
  ) {
    const token =
      authorization
        .slice(7)
        .trim();

    return token ||
      null;
  }

  return null;
};

const verifyToken = (
  token
) =>
  jwt.verify(
    token,
    process.env.JWT_SECRET,
    {
      algorithms: [
        'HS256'
      ]
    }
  );

const sessionIsCurrent = (
  payload,
  user
) => {
  /*
   * Existing JWTs created before tokenVersion was added
   * are treated as version 0.
   *
   * This avoids logging everyone out immediately after
   * this deployment, while still allowing password
   * changes to invalidate old sessions.
   */
  const tokenVersion =
    Number(
      payload.ver ??
        0
    );

  const userVersion =
    Number(
      user.tokenVersion ??
        0
    );

  return (
    tokenVersion ===
    userVersion
  );
};

export const protect =
  asyncHandler(
    async (
      req,
      _res,
      next
    ) => {
      const token =
        readToken(
          req
        );

      if (!token) {
        throw new ApiError(
          401,
          'Authentication required.'
        );
      }

      let payload;

      try {
        payload =
          verifyToken(
            token
          );
      } catch {
        throw new ApiError(
          401,
          'Your session is invalid or expired.'
        );
      }

      const user =
        await User.findById(
          payload.sub
        );

      if (
        !user ||
        user.status !==
          'Active'
      ) {
        throw new ApiError(
          401,
          'Account is not available.'
        );
      }

      if (
        !sessionIsCurrent(
          payload,
          user
        )
      ) {
        throw new ApiError(
          401,
          'Your session has expired. Please sign in again.',
          [],
          'SESSION_REVOKED'
        );
      }

      req.user =
        user;

      req.auth = {
        token,
        payload
      };

      next();
    }
  );

export const optionalProtect =
  asyncHandler(
    async (
      req,
      _res,
      next
    ) => {
      const token =
        readToken(
          req
        );

      if (!token) {
        return next();
      }

      try {
        const payload =
          verifyToken(
            token
          );

        const user =
          await User.findById(
            payload.sub
          );

        if (
          user?.status ===
            'Active' &&
          sessionIsCurrent(
            payload,
            user
          )
        ) {
          req.user =
            user;

          req.auth = {
            token,
            payload
          };
        }
      } catch {
        /*
         * Public request continues anonymously.
         */
      }

      next();
    }
  );

export const maintenanceGuard =
  asyncHandler(
    async (
      req,
      _res,
      next
    ) => {
      if (
        [
          'admin',
          'moderator',
          'super_admin'
        ].includes(
          req.user.role
        )
      ) {
        return next();
      }

      if (
        (
          await getSystemSettings()
        ).maintenanceMode
      ) {
        throw new ApiError(
          503,
          'The member portal is temporarily unavailable for maintenance.',
          [],
          'MAINTENANCE_MODE'
        );
      }

      next();
    }
  );

export const permit =
  (...roles) =>
  (
    req,
    _res,
    next
  ) =>
    roles.includes(
      req.user.role
    )
      ? next()
      : next(
          new ApiError(
            403,
            'You do not have permission to perform this action.'
          )
        );