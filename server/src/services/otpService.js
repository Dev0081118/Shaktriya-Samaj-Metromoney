import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

import OtpVerification from '../models/OtpVerification.js';
import { ApiError } from '../utils/http.js';

const OTP_EXPIRY_MS =
  10 * 60 * 1000;

const OTP_RESEND_COOLDOWN_MS =
  60 * 1000;

const MAX_ATTEMPTS =
  5;

class DevelopmentOtpProvider {
  async send(
    destination,
    code
  ) {
    console.info(
      `[development OTP] ${destination}: ${code}`
    );
  }
}

class TwilioOtpProvider {
  async send(
    destination,
    code
  ) {
    const {
      TWILIO_ACCOUNT_SID:
        sid,

      TWILIO_AUTH_TOKEN:
        token,

      TWILIO_FROM_NUMBER:
        from
    } = process.env;

    if (
      !sid ||
      !token ||
      !from
    ) {
      throw new ApiError(
        503,
        'Twilio OTP credentials are incomplete.'
      );
    }

    const body =
      new URLSearchParams({
        To:
          destination,

        From:
          from,

        Body:
          `Your Kshatriya verification code is ${code}. It expires in 10 minutes.`
      });

    const response =
      await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method:
            'POST',

          headers: {
            Authorization:
              `Basic ${Buffer.from(
                `${sid}:${token}`
              ).toString(
                'base64'
              )}`,

            'Content-Type':
              'application/x-www-form-urlencoded'
          },

          body
        }
      );

    if (!response.ok) {
      throw new ApiError(
        502,
        'Unable to send the verification code.'
      );
    }
  }
}

class Msg91OtpProvider {
  async send(
    destination,
    code
  ) {
    const {
      MSG91_AUTH_KEY:
        key,

      MSG91_TEMPLATE_ID:
        templateId
    } = process.env;

    if (
      !key ||
      !templateId
    ) {
      throw new ApiError(
        503,
        'MSG91 OTP credentials are incomplete.'
      );
    }

    const mobile =
      destination.replace(
        /\D/g,
        ''
      );

    const response =
      await fetch(
        'https://control.msg91.com/api/v5/otp',
        {
          method:
            'POST',

          headers: {
            authkey:
              key,

            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify({
              template_id:
                templateId,

              mobile,

              otp:
                code
            })
        }
      );

    if (!response.ok) {
      throw new ApiError(
        502,
        'Unable to send the verification code.'
      );
    }
  }
}

const provider = () => {
  const selected =
    process.env.OTP_PROVIDER ||
    'development';

  if (
    selected ===
    'development'
  ) {
    return new DevelopmentOtpProvider();
  }

  if (
    selected ===
    'twilio'
  ) {
    return new TwilioOtpProvider();
  }

  if (
    selected ===
    'msg91'
  ) {
    return new Msg91OtpProvider();
  }

  throw new ApiError(
    503,
    'OTP provider is not supported.'
  );
};

export async function sendOtp(
  destination
) {
  if (!destination) {
    throw new ApiError(
      400,
      'A valid mobile number is required.'
    );
  }

  /*
   * Destination-level cooldown.
   *
   * IP rate limiting already exists in app.js,
   * but this also prevents repeatedly targeting
   * the same phone number from different clients.
   */
  const recent =
    await OtpVerification.findOne({
      destination,

      createdAt: {
        $gte:
          new Date(
            Date.now() -
              OTP_RESEND_COOLDOWN_MS
          )
      }
    })
      .sort(
        '-createdAt'
      )
      .lean();

  if (recent) {
    const retryAfterMs =
      Math.max(
        0,
        OTP_RESEND_COOLDOWN_MS -
          (
            Date.now() -
            new Date(
              recent.createdAt
            ).getTime()
          )
      );

    throw new ApiError(
      429,
      `Please wait ${Math.max(
        1,
        Math.ceil(
          retryAfterMs /
            1000
        )
      )} seconds before requesting another code.`
    );
  }

  const code =
    String(
      crypto.randomInt(
        100000,
        1000000
      )
    );

  await provider().send(
    destination,
    code
  );

  /*
   * Only the latest OTP should remain usable.
   */
  await OtpVerification.deleteMany({
    destination,
    verifiedAt:
      null
  });

  await OtpVerification.create({
    destination,

    purpose:
      'phone_verification',

    codeHash:
      await bcrypt.hash(
        code,
        10
      ),

    expiresAt:
      new Date(
        Date.now() +
          OTP_EXPIRY_MS
      )
  });

  return {
    expiresInSeconds:
      OTP_EXPIRY_MS /
      1000,

    resendAfterSeconds:
      OTP_RESEND_COOLDOWN_MS /
      1000,

    development:
      (
        process.env.OTP_PROVIDER ||
        'development'
      ) ===
      'development'
  };
}

export async function verifyOtp(
  destination,
  code
) {
  if (
    !/^\d{6}$/.test(
      String(
        code ||
          ''
      )
    )
  ) {
    throw new ApiError(
      400,
      'Enter the complete 6-digit verification code.'
    );
  }

  const record =
    await OtpVerification.findOne({
      destination,

      purpose:
        'phone_verification',

      verifiedAt:
        null
    }).sort(
      '-createdAt'
    );

  if (
    !record ||
    record.expiresAt <
      Date.now()
  ) {
    throw new ApiError(
      400,
      'The verification code has expired.'
    );
  }

  if (
    record.attempts >=
    MAX_ATTEMPTS
  ) {
    throw new ApiError(
      429,
      'Too many verification attempts. Request a new code.'
    );
  }

  const valid =
    await bcrypt.compare(
      String(code),
      record.codeHash
    );

  if (!valid) {
    record.attempts +=
      1;

    await record.save();

    if (
      record.attempts >=
      MAX_ATTEMPTS
    ) {
      throw new ApiError(
        429,
        'Too many verification attempts. Request a new code.'
      );
    }

    throw new ApiError(
      400,
      'The verification code is incorrect.'
    );
  }

  record.verifiedAt =
    new Date();

  await record.save();

  return true;
}