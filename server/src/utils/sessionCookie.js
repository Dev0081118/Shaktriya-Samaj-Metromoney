export const SESSION_COOKIE_NAME =
  'ksm_session';

const isProduction =
  () =>
    process.env.NODE_ENV ===
    'production';

const cookieSameSite =
  () => {
    const configured =
      String(
        process.env
          .SESSION_COOKIE_SAME_SITE ||
          ''
      )
        .trim()
        .toLowerCase();

    if (
      [
        'lax',
        'strict',
        'none'
      ].includes(
        configured
      )
    ) {
      return configured;
    }

    return 'lax';
  };

const cookieSecure =
  () => {
    /*
     * SameSite=None is accepted by modern browsers
     * only when Secure is also enabled.
     */
    if (
      cookieSameSite() ===
      'none'
    ) {
      return true;
    }

    return isProduction();
  };

const cookieMaxAge =
  () => {
    const configured =
      Number(
        process.env
          .SESSION_COOKIE_MAX_AGE_MS
      );

    if (
      Number.isFinite(
        configured
      ) &&
      configured > 0
    ) {
      return configured;
    }

    /*
     * Default matches JWT_EXPIRES_IN=7d.
     */
    return (
      7 *
      24 *
      60 *
      60 *
      1000
    );
  };

const baseOptions =
  () => ({
    httpOnly:
      true,

    secure:
      cookieSecure(),

    sameSite:
      cookieSameSite(),

    path:
      '/',

    priority:
      'high'
  });

export const setSessionCookie =
  (
    res,
    token
  ) => {
    res.cookie(
      SESSION_COOKIE_NAME,
      token,
      {
        ...baseOptions(),

        maxAge:
          cookieMaxAge()
      }
    );
  };

export const clearSessionCookie =
  (
    res
  ) => {
    res.clearCookie(
      SESSION_COOKIE_NAME,
      baseOptions()
    );
  };