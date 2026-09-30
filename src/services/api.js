const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
export async function api(path, options = {}) {
  const token = localStorage.getItem("ksm_token"); const isForm = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers:{ ...(isForm?{}:{"Content-Type":"application/json"}), ...(token?{Authorization:`Bearer ${token}`} : {}), ...options.headers } });
  const data = await response.json().catch(() => ({ success:false, message:"Unable to read server response." }));
  if (!response.ok) throw new Error(data.message || "Something went wrong."); return data;
}
