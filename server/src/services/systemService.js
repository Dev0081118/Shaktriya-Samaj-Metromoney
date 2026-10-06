import {
  SystemSetting
} from '../models/Business.js';

export const systemDefaults = {
  platformName:
    'Kshatriya Matrimonial Society',

  supportEmail:
    '',

  supportPhone:
    '',

  maintenanceMode:
    false,

  registrationEnabled:
    true,

  paymentsEnabled:
    true,

  maxPhotos:
    6,

  defaultCountry:
    'India'
};

export async function getSystemSettings() {
  const stored =
    await SystemSetting.findById(
      'global'
    ).lean();

  return {
    ...systemDefaults,
    ...stored
  };
}

const required = (
  name,
  keys
) => ({
  name,

  configured:
    keys.every(
      (
        key
      ) =>
        Boolean(
          String(
            process.env[
              key
            ] ||
              ''
          ).trim()
        )
    ),

  missing:
    keys.filter(
      (
        key
      ) =>
        !String(
          process.env[
            key
          ] ||
            ''
        ).trim()
    )
});

export function providerDiagnostics() {
  const otp =
    process.env
      .OTP_PROVIDER ||
    'development';

  const media =
    process.env
      .MEDIA_PROVIDER ||
    'local';

  const email =
    process.env
      .EMAIL_PROVIDER ||
    'development';

  return {
    otp:
      otp ===
      'twilio'
        ? required(
            'twilio',
            [
              'TWILIO_ACCOUNT_SID',
              'TWILIO_AUTH_TOKEN',
              'TWILIO_FROM_NUMBER'
            ]
          )
        : otp ===
            'msg91'
          ? required(
              'msg91',
              [
                'MSG91_AUTH_KEY',
                'MSG91_TEMPLATE_ID'
              ]
            )
          : {
              name:
                'development',

              configured:
                true,

              missing:
                []
            },

    media:
      media ===
      'cloudinary'
        ? required(
            'cloudinary',
            [
              'CLOUDINARY_CLOUD_NAME',
              'CLOUDINARY_API_KEY',
              'CLOUDINARY_API_SECRET'
            ]
          )
        : {
            name:
              'local',

            configured:
              true,

            missing:
              []
          },

    email:
      email ===
      'resend'
        ? required(
            'resend',
            [
              'RESEND_API_KEY',
              'EMAIL_FROM'
            ]
          )
        : {
            name:
              'development',

            configured:
              true,

            missing:
              []
          },

    payments:
      required(
        'razorpay',
        [
          'RAZORPAY_KEY_ID',
          'RAZORPAY_KEY_SECRET',
          'RAZORPAY_WEBHOOK_SECRET'
        ]
      )
  };
}

const validateJwtSecret =
  () => {
    const secret =
      String(
        process.env
          .JWT_SECRET ||
          ''
      ).trim();

    if (
      secret.length <
      32
    ) {
      throw new Error(
        'JWT_SECRET must contain at least 32 characters in production.'
      );
    }

    const unsafeValues = [
      'replace-with-a-long-random-secret',
      'replace-with-at-least-32-random-characters',
      'secret',
      'changeme',
      'development-secret'
    ];

    if (
      unsafeValues.includes(
        secret.toLowerCase()
      )
    ) {
      throw new Error(
        'JWT_SECRET is using an unsafe placeholder value.'
      );
    }
  };

const validateClientUrls =
  () => {
    const values =
      String(
        process.env
          .CLIENT_URL ||
          ''
      )
        .split(
          ','
        )
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
      !values.length
    ) {
      throw new Error(
        'CLIENT_URL is required in production.'
      );
    }

    for (
      const value
      of values
    ) {
      let parsed;

      try {
        parsed =
          new URL(
            value
          );
      } catch {
        throw new Error(
          `CLIENT_URL contains an invalid URL: ${value}`
        );
      }

      if (
        parsed.protocol !==
          'https:' &&
        parsed.hostname !==
          'localhost'
      ) {
        throw new Error(
          `Production CLIENT_URL must use HTTPS: ${value}`
        );
      }
    }
  };

const validateEmailConfig =
  () => {
    const provider =
      String(
        process.env
          .EMAIL_PROVIDER ||
          ''
      ).trim();

    if (
      provider !==
      'resend'
    ) {
      throw new Error(
        'Production EMAIL_PROVIDER must be resend.'
      );
    }

    const from =
      String(
        process.env
          .EMAIL_FROM ||
          ''
      ).trim();

    /*
     * Supports:
     * noreply@example.com
     * Kshatriya Matrimonial <noreply@example.com>
     */
    const match =
      from.match(
        /(?:<)?([^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)(?:>)?/
      );

    if (!match) {
      throw new Error(
        'EMAIL_FROM must contain a valid sender email address.'
      );
    }
  };

export function validateProductionConfig() {
  if (
    process.env
      .NODE_ENV !==
    'production'
  ) {
    return;
  }

  const base =
    required(
      'core',
      [
        'MONGO_URI',
        'JWT_SECRET',
        'CLIENT_URL',
        'LEGAL_VERSION',
        'LEGAL_EFFECTIVE_DATE'
      ]
    );

  const providers =
    providerDiagnostics();

  const failures = [
    base,
    ...Object.values(
      providers
    )
  ].filter(
    (
      item
    ) =>
      !item.configured ||
      [
        'development',
        'local'
      ].includes(
        item.name
      )
  );

  if (
    failures.length
  ) {
    throw new Error(
      `Production configuration is incomplete: ${failures
        .map(
          (
            item
          ) =>
            `${
              item.name
            } (${
              item.missing
                ?.join(
                  ', '
                ) ||
              'development-only provider'
            })`
        )
        .join(
          '; '
        )}`
    );
  }

  validateJwtSecret();
  validateClientUrls();
  validateEmailConfig();

  const razorpayKeyId =
    String(
      process.env
        .RAZORPAY_KEY_ID ||
        ''
    );

  if (
    !razorpayKeyId.startsWith(
      'rzp_'
    )
  ) {
    throw new Error(
      'RAZORPAY_KEY_ID does not look valid.'
    );
  }
}