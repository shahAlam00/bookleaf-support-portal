const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api'
).replace(/\/+$/, '');

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  'http://localhost:5000';

export class ApiError extends Error {
  constructor(message, status = 0, payload = null) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export async function api(path, { method = 'GET', token, body, query, signal } = {}) {
  const url = new URL(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`);
  if (query) Object.entries(query).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v)); });
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal });
  } catch (err) {
    throw new ApiError('Cannot reach the BookLeaf API. Check that the backend is running on port 5000 and VITE_API_BASE_URL is correct.');
  }
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message || payload?.error || `Request failed (${response.status})`, response.status, payload);
  }
  return payload?.data !== undefined ? payload.data : payload;
}

export const authApi = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }),
  me: (token) => api('/auth/me', { token })
};
export const authorApi = {
  profile: (token) => api('/authors/me', { token }),
  books: (token) => api('/books/my-books', { token }),
  tickets: (token, query = {}) => api('/tickets/my-tickets', { token, query }),
  createTicket: (token, body) => api('/tickets', { method: 'POST', token, body }),
  ticket: (token, id) => api(`/tickets/${id}`, { token })
};
export const adminApi = {
  dashboard: (token) => api('/tickets/admin/dashboard', { token }),
  tickets: (token, query = {}) => api('/tickets/admin/tickets', { token, query }),
  ticket: (token, id) => api(`/tickets/${id}`, { token }),
  draft: (token, id) => api(`/tickets/admin/tickets/${id}/draft`, { method: 'POST', token }),
  update: (token, id, body) => api(`/tickets/admin/tickets/${id}`, { method: 'PATCH', token, body }),
  reply: (token, id, message) => api(`/tickets/admin/tickets/${id}/reply`, { method: 'POST', token, body: { message } }),
  note: (token, id, note) => api(`/tickets/admin/tickets/${id}/notes`, { method: 'POST', token, body: { note } })
};
export const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
export const date = (value, options = { day: '2-digit', month: 'short', year: 'numeric' }) => value ? new Intl.DateTimeFormat('en-IN', options).format(new Date(value)) : '—';
export const initials = (name = 'BookLeaf User') => name.split(/\s+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase();
export const getArray = (value) => Array.isArray(value) ? value : Array.isArray(value?.items) ? value.items : Array.isArray(value?.data) ? value.data : [];
