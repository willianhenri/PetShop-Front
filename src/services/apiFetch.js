import { API_BASE_URL } from '../config/api';

function getValidationMessages(errors) {
  if (!errors || typeof errors !== 'object') return [];

  return Object.values(errors)
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .filter((value) => typeof value === 'string' && value.trim())
    .map((value) => value.trim());
}

export async function getApiErrorMessage(response, fallbackMessage) {
  const rawBody = (await response.clone().text()).trim();

  if (!rawBody || rawBody.startsWith('<')) return fallbackMessage;

  try {
    const data = JSON.parse(rawBody);

    if (typeof data === 'string' && data.trim()) return data.trim();

    const message = data?.message || data?.error || data?.title;
    if (typeof message === 'string' && message.trim()) return message.trim();

    const validationMessages = getValidationMessages(data?.errors);
    if (validationMessages.length) return validationMessages.join(' ');
  } catch {
    return rawBody;
  }

  return fallbackMessage;
}

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
