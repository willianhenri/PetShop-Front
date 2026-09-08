export const normalizeText = (value) => value.trim().replace(/\s+/g, ' ');

export function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  const split = digits.length > 10 ? 7 : 6;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, split)}${digits.length > split ? `-${digits.slice(split)}` : ''}`;
}

export function validateClient({ name, phone, email, address }) {
  const normalized = {
    name: normalizeText(name),
    phone: phone.replace(/\D/g, ''),
    email: email.trim().toLowerCase(),
    address: normalizeText(address),
  };
  if (!normalized.name || !normalized.address) throw new Error('Preencha nome e endereço.');
  if (!/^[1-9]{2}(?:[2-5]\d{7}|9\d{8})$/.test(normalized.phone)) {
    throw new Error('Informe um telefone válido com DDD (10 ou 11 dígitos).');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email))
    throw new Error('Informe um e-mail válido.');
  return normalized;
}

export function nonNegativeNumber(value, label, integer = false) {
  const number = Number(value);
  if (
    String(value).trim() === '' ||
    !Number.isFinite(number) ||
    number < 0 ||
    (integer && !Number.isSafeInteger(number))
  ) {
    throw new Error(
      `${label} deve ser um número ${integer ? 'inteiro ' : ''}válido e não negativo.`,
    );
  }
  return number;
}

export function validatePassword(password, confirmation) {
  if (password.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.');
  if (password !== confirmation) throw new Error('As senhas não coincidem.');
}

export function validateAppointment(value, now = Date.now()) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time) || time < now)
    throw new Error('Escolha uma data e hora futuras para o agendamento.');
  return new Date(time).toISOString();
}

export function minimumAppointmentTime(now = Date.now()) {
  const date = new Date(Math.ceil(now / 60000) * 60000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
