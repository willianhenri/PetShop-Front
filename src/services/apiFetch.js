import { API_BASE_URL } from '../config/api';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('petshop_token');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('petshop_token');
    localStorage.removeItem('petshop_role');

    window.location.assign('/login?reason=session-expired');

    throw new Error('Sessão expirada.');
  }

  return response;
}