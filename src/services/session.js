const KEYS = ['petshop_token', 'petshop_role', 'petshop_name'];

export function clearLegacySession() {
  for (const key of KEYS) localStorage.removeItem(key);
}

export function clearSession() {
  for (const key of KEYS) {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }
}

export function saveSession(token, role) {
  if (
    typeof token !== 'string' ||
    !token.trim() ||
    !['Funcionario', 'Admin', 'SuperAdmin'].includes(role)
  ) {
    throw new Error('Resposta de autenticação inválida. Tente novamente.');
  }
  clearSession();
  sessionStorage.setItem(KEYS[0], token);
  sessionStorage.setItem(KEYS[1], role);
}

export const getToken = () => sessionStorage.getItem(KEYS[0]);
export const getRole = () => sessionStorage.getItem(KEYS[1]);
export const isAdmin = () => ['Admin', 'SuperAdmin'].includes(getRole());
