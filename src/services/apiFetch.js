import { API_BASE_URL } from '../config/api';
import { clearSession, getToken } from './session';

function getValidationMessages(errors) {
  if (!errors || typeof errors !== 'object') return [];

  return Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
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
  const { anonymous = false, ...requestOptions } = options;
  const token = anonymous ? null : getToken();
  const headers = new Headers(requestOptions.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...requestOptions, headers });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
      { cause: error },
    );
  }

  if (response.status === 401 && !anonymous) {
    clearSession();
    window.location.replace('/login?reason=session-expired');
    throw new Error('Sua sessão expirou. Entre novamente para continuar.');
  }

  if (response.status === 403)
    throw new Error('Seu perfil não tem permissão para realizar esta ação.');

  return response;
}

export async function apiList(path, { signal } = {}) {
  // The API has pagination but no shared search/sort contract. Load every page
  // before applying client-side filters, including options in dependent selects.
  const items = [];
  let page = 1;
  let totalPages;
  do {
    const separator = path.includes('?') ? '&' : '?';
    const response = await apiFetch(`${path}${separator}pageNumber=${page}&pageSize=100`, {
      signal,
    });
    if (!response.ok)
      throw new Error(await getApiErrorMessage(response, 'Erro ao carregar os registros.'));
    const body = await response.json();
    const data = Array.isArray(body) ? body : body?.data;
    if (!Array.isArray(data)) throw new Error('O servidor retornou uma lista inválida.');
    items.push(...data);
    totalPages = Number(body?.pagination?.totalPages ?? 1);
    if (!Number.isInteger(totalPages) || totalPages < 0 || totalPages > 10000) {
      throw new Error('O servidor retornou uma paginação inválida.');
    }
    if (page < totalPages && data.length === 0)
      throw new Error('A lista recebida está incompleta. Tente novamente.');
    page += 1;
  } while (page <= totalPages);
  return items;
}
