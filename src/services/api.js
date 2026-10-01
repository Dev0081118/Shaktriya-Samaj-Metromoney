const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const assetUrl = (path) =>
  !path
    ? ''
    : path.startsWith('/assets/')
      ? path
    : path.startsWith('http')
      ? path
      : `${API_URL.replace(/\/api$/, '')}${path}`;
export async function api(path, options = {}) {
  const token = localStorage.getItem('ksm_token');
  const isForm = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({
    success: false,
    message: 'Unable to read server response.'
  }));
  if (response.status === 401) {
    localStorage.removeItem('ksm_token');
    window.dispatchEvent(new Event('ksm:unauthorized'));
  }
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong.');
    error.code = data.code;
    error.requestId = data.requestId;
    throw error;
  }
  return data;
}
