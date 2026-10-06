const sensitive =
  /password|otp|token|secret|authorization/i;

const copy = {
  welcome:
    'Welcome to Kshatriya Matrimonial Society',

  'profile-approved':
    'Your profile has been approved',

  'changes-requested':
    'Changes requested for your profile',

  'profile-moderation':
    'Profile moderation update',

  'interest-received':
    'A family expressed interest',

  'interest-accepted':
    'Your interest was accepted',

  'contact-request-received':
    'You received a contact request',

  'contact-accepted':
    'Your contact request was accepted',

  'payment-receipt':
    'Payment received',

  'subscription-activated':
    'Your membership is active',

  'password-changed':
    'Your password was changed',

  'password-reset':
    'Your password reset code',

  'account-access-updated':
    'Your account access was updated'
};

const localizedCopy = {
  gu: {
    welcome:
      'ક્ષત્રિય મેટ્રિમોનિયલ સોસાયટીમાં આપનું સ્વાગત છે',

    'profile-approved':
      'તમારી પ્રોફાઇલ મંજૂર થઈ છે',

    'changes-requested':
      'તમારી પ્રોફાઇલમાં ફેરફાર જરૂરી છે',

    'profile-moderation':
      'તમારી પ્રોફાઇલ અંગે અપડેટ',

    'interest-received':
      'એક પરિવારે રસ દર્શાવ્યો છે',

    'interest-accepted':
      'તમારો રસ સ્વીકારાયો છે',

    'contact-request-received':
      'તમને સંપર્ક વિગતો માટે વિનંતી મળી છે',

    'contact-accepted':
      'તમારી સંપર્ક વિનંતી સ્વીકારાઈ છે',

    'payment-receipt':
      'ચુકવણી મળી છે',

    'subscription-activated':
      'તમારું સભ્યપદ સક્રિય છે',

    'password-changed':
      'તમારો પાસવર્ડ બદલાયો છે',

    'password-reset':
      'તમારો પાસવર્ડ રીસેટ કોડ',

    'account-access-updated':
      'તમારા એકાઉન્ટ ઍક્સેસમાં ફેરફાર થયો છે'
  },

  hi: {
    welcome:
      'क्षत्रिय मैट्रिमोनियल सोसाइटी में आपका स्वागत है',

    'profile-approved':
      'आपकी प्रोफ़ाइल स्वीकृत हो गई है',

    'changes-requested':
      'आपकी प्रोफ़ाइल में बदलाव आवश्यक हैं',

    'profile-moderation':
      'आपकी प्रोफ़ाइल से संबंधित अपडेट',

    'interest-received':
      'एक परिवार ने रुचि भेजी है',

    'interest-accepted':
      'आपकी रुचि स्वीकार हुई है',

    'contact-request-received':
      'आपको संपर्क विवरण के लिए अनुरोध मिला है',

    'contact-accepted':
      'आपका संपर्क अनुरोध स्वीकार हुआ है',

    'payment-receipt':
      'भुगतान प्राप्त हुआ',

    'subscription-activated':
      'आपकी सदस्यता सक्रिय है',

    'password-changed':
      'आपका पासवर्ड बदल गया है',

    'password-reset':
      'आपका पासवर्ड रीसेट कोड',

    'account-access-updated':
      'आपके अकाउंट एक्सेस में बदलाव हुआ है'
  }
};

const escapeHtml = (
  value
) =>
  String(
    value ?? ''
  )
    .replaceAll(
      '&',
      '&amp;'
    )
    .replaceAll(
      '<',
      '&lt;'
    )
    .replaceAll(
      '>',
      '&gt;'
    )
    .replaceAll(
      '"',
      '&quot;'
    )
    .replaceAll(
      "'",
      '&#039;'
    );

const displayValue = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  if (
    typeof value ===
    'object'
  ) {
    try {
      return JSON.stringify(
        value
      );
    } catch {
      return String(
        value
      );
    }
  }

  return String(
    value
  );
};

const safeData = (
  data = {}
) =>
  Object.fromEntries(
    Object.entries(
      data
    ).filter(
      ([key]) =>
        !sensitive.test(
          key
        )
    )
  );

const validEmail = (
  value
) =>
  typeof value ===
    'string' &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim()
  );

export function renderEmailHtml(
  template,
  data = {},
  language = 'en'
) {
  const safeLanguage =
    [
      'en',
      'gu',
      'hi'
    ].includes(
      language
    )
      ? language
      : 'en';

  const heading =
    localizedCopy[
      safeLanguage
    ]?.[template] ||
    copy[template] ||
    'Kshatriya Matrimonial Society';

  const rows =
    Object.entries(
      safeData(
        data
      )
    )
      .map(
        ([
          key,
          value
        ]) => `
          <tr>
            <td style="
              padding:8px 0;
              color:#756a60;
              font-size:13px;
              vertical-align:top;
              width:140px;
            ">
              ${escapeHtml(
                key
              )}
            </td>

            <td style="
              padding:8px 0;
              color:#191614;
              font-size:14px;
              font-weight:600;
              vertical-align:top;
            ">
              ${escapeHtml(
                displayValue(
                  value
                )
              )}
            </td>
          </tr>
        `
      )
      .join(
        ''
      );

  return `
    <!doctype html>
    <html lang="${escapeHtml(
      safeLanguage
    )}">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </head>

      <body
        style="
          margin:0;
          padding:0;
          background:#f5f0e8;
          font-family:Arial,sans-serif;
          color:#191614;
        "
      >
        <div
          style="
            width:100%;
            padding:32px 16px;
            box-sizing:border-box;
          "
        >
          <div
            style="
              max-width:620px;
              margin:0 auto;
              background:#fffdf8;
              border:1px solid #ddd0c1;
              padding:32px;
              box-sizing:border-box;
            "
          >
            <div
              style="
                font-size:11px;
                font-weight:700;
                letter-spacing:.15em;
                text-transform:uppercase;
                color:#aa7a42;
                margin-bottom:12px;
              "
            >
              Kshatriya Matrimonial Society
            </div>

            <h1
              style="
                margin:0 0 24px;
                color:#681d25;
                font-family:Georgia,serif;
                font-size:30px;
                line-height:1.15;
                font-weight:500;
              "
            >
              ${escapeHtml(
                heading
              )}
            </h1>

            ${
              rows
                ? `
                  <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    style="
                      border-collapse:collapse;
                      margin-bottom:24px;
                    "
                  >
                    ${rows}
                  </table>
                `
                : ''
            }

            <div
              style="
                border-top:1px solid #ddd0c1;
                padding-top:20px;
                margin-top:20px;
                color:#756a60;
                font-size:12px;
                line-height:1.7;
              "
            >
              For your security, never share your password,
              OTP, payment credentials or verification codes
              with anyone.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export const emailService = {
  async send({
    to,
    subject,
    template,
    data = {},
    language = 'en'
  }) {
    if (
      !validEmail(
        to
      )
    ) {
      throw new Error(
        'A valid email recipient is required.'
      );
    }

    const cleanSubject =
      typeof subject ===
      'string'
        ? subject
            .trim()
            .slice(
              0,
              200
            )
        : '';

    if (!cleanSubject) {
      throw new Error(
        'Email subject is required.'
      );
    }

    const safe =
      safeData(
        data
      );

    const provider =
      process.env
        .EMAIL_PROVIDER ||
      'development';

    if (
      provider ===
      'development'
    ) {
      console.info(
        '[email:development]',
        {
          to,
          subject:
            cleanSubject,
          template,
          data:
            safe
        }
      );

      return {
        provider:
          'development'
      };
    }

    if (
      provider ===
      'resend'
    ) {
      const apiKey =
        String(
          process.env
            .RESEND_API_KEY ||
            ''
        ).trim();

      const from =
        String(
          process.env
            .EMAIL_FROM ||
            ''
        ).trim();

      if (
        !apiKey ||
        !from
      ) {
        throw new Error(
          'Resend email credentials are incomplete.'
        );
      }

      let response;

      try {
        response =
          await fetch(
            'https://api.resend.com/emails',
            {
              method:
                'POST',

              headers: {
                Authorization:
                  `Bearer ${apiKey}`,

                'Content-Type':
                  'application/json'
              },

              body:
                JSON.stringify({
                  from,

                  to: [
                    to.trim()
                  ],

                  subject:
                    cleanSubject,

                  html:
                    renderEmailHtml(
                      template,
                      safe,
                      language
                    )
                }),

              signal:
                AbortSignal.timeout(
                  10000
                )
            }
          );
      } catch (error) {
  if (
    error?.name ===
      'TimeoutError' ||
    error?.name ===
      'AbortError'
  ) {
    throw new Error(
      'Email provider request timed out.',
      {
        cause:
          error
      }
    );
  }

  throw new Error(
    'Email provider is currently unavailable.',
    {
      cause:
        error
    }
  );
}

      const result =
        await response
          .json()
          .catch(
            () => ({})
          );

      if (
        !response.ok
      ) {
        console.error(
          'Resend rejected email:',
          {
            status:
              response.status,

            code:
              result?.name ||
              result?.code ||
              'unknown'
          }
        );

        throw new Error(
          'Email provider rejected the message.'
        );
      }

      if (
        !result?.id
      ) {
        throw new Error(
          'Email provider returned an invalid response.'
        );
      }

      return {
        provider:
          'resend',

        id:
          result.id
      };
    }

    throw new Error(
      `Unsupported email provider: ${provider}`
    );
  }
};

export async function sendEmailSafely(
  message
) {
  try {
    await emailService.send(
      message
    );

    return true;
  } catch (error) {
    console.error(
      'Email delivery failed:',
      error.message
    );

    return false;
  }
}