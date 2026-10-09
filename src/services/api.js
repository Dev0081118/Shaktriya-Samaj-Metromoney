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
    path.startsWith(
      'http'
    )
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
  const isForm =
    options.body instanceof
    FormData;

  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...options,

        /*
         * Browser authentication is now handled
         * exclusively by the secure httpOnly
         * session cookie.
         */
        credentials:
          'include',

        headers: {
          ...(isForm
            ? {}
            : {
                'Content-Type':
                  'application/json'
              }),

          ...options.headers
        }
      }
    );

  const data =
    await response
      .json()
      .catch(() => ({
        success:
          false,

        message:
          'Unable to read server response.'
      }));

  if (
    response.status ===
    401
  ) {
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