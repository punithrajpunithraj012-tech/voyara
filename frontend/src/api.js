// One place for all backend calls. Change BASE (VITE_API_URL) when the API is hosted elsewhere or used by a mobile app.
const BASE = import.meta.env.VITE_API_URL || '/api';
export const getToken = () => localStorage.getItem('vy_token');
export const setToken = (t) => (t ? localStorage.setItem('vy_token', t) : localStorage.removeItem('vy_token'));

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the Voyara server. Make sure the backend is running on port 4000.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && getToken() && !path.startsWith('/auth/login')) {
      setToken(null);
      window.dispatchEvent(new Event('vy-logout'));
    }
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}
