import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import MatrimonialProfile from '../models/MatrimonialProfile.js';

import {
  asyncHandler,
  ApiError,
  ok
} from '../utils/http.js';

import {
  sendOtp,
  verifyOtp
} from '../services/otpService.js';

import {
  getSystemSettings
} from '../services/systemService.js';

import {
  emailUser
} from '../services/notificationEmailService.js';

const normalizePhone = (
  value
) =>
  value
    ? `+${String(
        value
      ).replace(
        /\D/g,
        ''
      )}`
    : undefined;

const tokenFor = (
  user
) =>
  jwt.sign(
    {
      sub:
        user.id,

      role:
        user.role,

      ver:
        Number(
          user.tokenVersion ??
            0
        )
    },

    process.env.JWT_SECRET,

    {
      expiresIn:
        process.env
          .JWT_EXPIRES_IN ||
        '7d',

      algorithm:
        'HS256'
    }
  );

const legalVersion =
  () =>
    process.env
      .LEGAL_VERSION ||
    'development-draft';

export const register =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const settings =
        await getSystemSettings();

      if (
        !settings.registrationEnabled
      ) {
        throw new ApiError(
          503,
          'New registrations are temporarily paused. Please return later.',
          [],
          'REGISTRATION_DISABLED'
        );
      }

      const email =
          typeof req.body.email ===
          'string'
            ? req.body.email
                .trim()
                .toLowerCase()
            : '',

        password =
          req.body.password,

        phone =
          normalizePhone(
            req.body.phone
          );

      if (
        !email ||
        !password ||
        password.length <
          8
      ) {
        throw new ApiError(
          400,
          'Email and a password of at least 8 characters are required.'
        );
      }

      if (
        req.body
          .acceptTerms !==
          true ||
        req.body
          .acceptPrivacy !==
          true
      ) {
        throw new ApiError(
          400,
          'Please agree to the Terms and acknowledge the Privacy Policy.'
        );
      }

      if (
        await User.findOne({
          $or: [
            {
              email
            },

            ...(phone
              ? [
                  {
                    phone
                  }
                ]
              : [])
          ]
        })
      ) {
        throw new ApiError(
          409,
          'An account already exists with these details.'
        );
      }

      const acceptedAt =
        new Date();

      const user =
        await User.create({
          email,

          phone,

          password,

          acceptedTermsVersion:
            legalVersion(),

          acceptedPrivacyVersion:
            legalVersion(),

          acceptedAt,

          preferredLanguage:
            [
              'en',
              'gu',
              'hi'
            ].includes(
              req.body
                .preferredLanguage
            )
              ? req.body
                  .preferredLanguage
              : 'en'
        });

      await emailUser(
        user._id,
        {
          subject:
            'Welcome to Kshatriya Matrimonial Society',

          template:
            'welcome',

          data: {
            platformName:
              settings.platformName
          }
        }
      );

      ok(
        res,
        {
          user,

          token:
            tokenFor(
              user
            )
        },

        'Account created.',

        201
      );
    }
  );

export const login =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const email =
          typeof req.body.email ===
          'string'
            ? req.body.email
                .trim()
                .toLowerCase()
            : null,

        phone =
          normalizePhone(
            req.body.phone
          );

      if (
        (
          !email &&
          !phone
        ) ||
        typeof req.body
          .password !==
          'string'
      ) {
        throw new ApiError(
          401,
          'Email/phone or password is incorrect.'
        );
      }

      const user =
        await User.findOne(
          email
            ? {
                email
              }
            : {
                phone
              }
        ).select(
          '+password'
        );

      if (
        !user ||
        !(
          await user.comparePassword(
            req.body.password
          )
        )
      ) {
        throw new ApiError(
          401,
          'Email/phone or password is incorrect.',
          [],
          'AUTH_INVALID_CREDENTIALS'
        );
      }

      if (
        user.status !==
        'Active'
      ) {
        throw new ApiError(
          403,
          'This account is not active.',
          [],
          'ACCOUNT_SUSPENDED'
        );
      }

      user.lastLoginAt =
        new Date();

      await user.save();

      await MatrimonialProfile.updateOne(
        {
          userId:
            user._id
        },

        {
          lastActiveAt:
            new Date()
        }
      );

      ok(
        res,
        {
          user,

          token:
            tokenFor(
              user
            )
        },

        'Signed in.'
      );
    }
  );

export const me =
  asyncHandler(
    async (
      req,
      res
    ) =>
      ok(
        res,
        {
          user:
            req.user
        }
      )
  );

export const saveLanguage =
  asyncHandler(
    async (
      req,
      res
    ) => {
      if (
        ![
          'en',
          'gu',
          'hi'
        ].includes(
          req.body
            .preferredLanguage
        )
      ) {
        throw new ApiError(
          400,
          'Unsupported language.'
        );
      }

      req.user
        .preferredLanguage =
        req.body
          .preferredLanguage;

      await req.user.save();

      ok(
        res,
        {
          preferredLanguage:
            req.user
              .preferredLanguage
        },

        'Language preference saved.'
      );
    }
  );

export const requestOtp =
  asyncHandler(
    async (
      req,
      res
    ) => {
      if (
        typeof req.body
          .phone !==
          'string' ||
        !req.body.phone.trim()
      ) {
        throw new ApiError(
          400,
          'A mobile number is required.'
        );
      }

      const phone =
        normalizePhone(
          req.body.phone
        );

      if (
        !phone ||
        phone.length <
          8
      ) {
        throw new ApiError(
          400,
          'Enter a valid mobile number.'
        );
      }

      ok(
        res,
        await sendOtp(
          phone
        ),
        'Verification code sent.'
      );
    }
  );

export const confirmOtp =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const phone =
        normalizePhone(
          req.body.phone
        );

      if (
        !phone
      ) {
        throw new ApiError(
          400,
          'A mobile number is required.'
        );
      }

      const existing =
        await User.findOne({
          phone,

          _id: {
            $ne:
              req.user._id
          }
        }).select(
          '_id'
        );

      if (
        existing
      ) {
        throw new ApiError(
          409,
          'This mobile number is already associated with another account.'
        );
      }

      await verifyOtp(
        phone,
        req.body.code
      );

      req.user.phone =
        phone;

      req.user.phoneVerified =
        true;

      await req.user.save();

      ok(
        res,
        {},
        'Mobile number verified.'
      );
    }
  );

export const changePassword =
  asyncHandler(
    async (
      req,
      res
    ) => {
      const {
        currentPassword,
        newPassword
      } = req.body;

      if (
        !newPassword ||
        newPassword.length <
          8
      ) {
        throw new ApiError(
          400,
          'New password must be at least 8 characters.'
        );
      }

      if (
        currentPassword ===
        newPassword
      ) {
        throw new ApiError(
          400,
          'New password must be different from your current password.'
        );
      }

      const user =
        await User.findById(
          req.user.id
        ).select(
          '+password'
        );

      if (
        !user ||
        !(
          await user.comparePassword(
            currentPassword
          )
        )
      ) {
        throw new ApiError(
          400,
          'Current password is incorrect.'
        );
      }

      user.password =
        newPassword;

      user.tokenVersion =
        Number(
          user.tokenVersion ??
            0
        ) + 1;

      await user.save();

      await emailUser(
        user._id,
        {
          security:
            true,

          subject:
            'Your password was changed',

          template:
            'password-changed',

          data: {
            changedAt:
              new Date()
                .toISOString()
          }
        }
      );

      /*
       * Return a fresh token for the current device.
       * All previous tokens immediately become invalid.
       */
      ok(
        res,
        {
          token:
            tokenFor(
              user
            )
        },
        'Password changed.'
      );
    }
  );