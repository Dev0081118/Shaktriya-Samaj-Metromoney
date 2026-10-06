const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001/api';

export const assetUrl = (
  path
) => {
  if (!path) {
    return '';
  }

  if (
    path.startsWith(
      '/assets/'
    )
  ) {
    return path;
  }

  if (
    path.startsWith('http')
  ) {
    return path;
  }

  return `${
    API_URL.replace(
      /\/api$/,
      ''
    )
  }${path}`;
};

export async function api(
  path,
  options = {}
) {
  const token =
    localStorage.getItem(
      'ksm_token'
    );

  const isForm =
    options.body instanceof
    FormData;

  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...options,

        headers: {
          ...(isForm
            ? {}
            : {
                'Content-Type':
                  'application/json'
              }),

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`
              }
            : {}),

          ...options.headers
        }
      }
    );

  const data =
    await response
      .json()
      .catch(() => ({
        success: false,

        message:
          'Unable to read server response.'
      }));

  /*
   * Some security-sensitive endpoints,
   * such as change-password, rotate the
   * current JWT.
   *
   * Persist the fresh token before any
   * following API request can use the
   * revoked token.
   */
  if (
    response.ok &&
    data?.data?.token
  ) {
    localStorage.setItem(
      'ksm_token',
      data.data.token
    );
  }

  if (
    response.status === 401
  ) {
    localStorage.removeItem(
      'ksm_token'
    );

    window.dispatchEvent(
      new Event(
        'ksm:unauthorized'
      )
    );
  }

  if (!response.ok) {
    const error =
      new Error(
        data.message ||
          'Something went wrong.'
      );

    error.code =
      data.code;

    error.requestId =
      data.requestId;

    throw error;
  }

  return data;
}