import { test, expect } from '@playwright/test';
import {
  validateClient,
  validatePassword,
  nonNegativeNumber,
  validateAppointment,
  minimumAppointmentTime,
} from '../src/utils/validation';

test('normaliza cadastro e valida telefone e e-mail', () => {
  const client = {
    name: '  Maria   Silva ',
    phone: '(11) 99999-1234',
    email: ' MARIA@EXEMPLO.COM ',
    address: ' Rua   A, 10 ',
  };
  expect(validateClient(client)).toEqual({
    name: 'Maria Silva',
    phone: '11999991234',
    email: 'maria@exemplo.com',
    address: 'Rua A, 10',
  });
  expect(validateClient({ ...client, phone: '(11) 3333-4444' }).phone).toBe('1133334444');
  for (const phone of ['119', '00000000000', '11111111111'])
    expect(() => validateClient({ ...client, phone })).toThrow(/telefone/);
  expect(() => validateClient({ ...client, email: 'a@' })).toThrow(/e-mail/);
  expect(() => validateClient({ ...client, name: '   ' })).toThrow(/nome/);
});

test('rejeita números vazios, negativos, infinitos e frações em inteiros', () => {
  for (const value of ['', ' ', 'abc', '-1', Infinity, '12abc'])
    expect(() => nonNegativeNumber(value, 'Preço')).toThrow();
  expect(() => nonNegativeNumber('1.5', 'Estoque', true)).toThrow();
  expect(nonNegativeNumber('0', 'Preço')).toBe(0);
  expect(nonNegativeNumber('12.50', 'Preço')).toBe(12.5);
});

test('senhas exigem mínimo e confirmação; agenda rejeita passado', () => {
  expect(() => validatePassword('curta', 'curta')).toThrow(/8/);
  expect(() => validatePassword('senha longa', 'outra senha')).toThrow(/coincidem/);
  expect(() => validatePassword('Minha frase longa!', 'Minha frase longa!')).not.toThrow();
  const now = Date.parse('2026-09-07T15:00:30Z');
  expect(() => validateAppointment('2026-09-07T15:00:00Z', now)).toThrow(/futuras/);
  expect(() => validateAppointment('inválido', now)).toThrow();
  expect(validateAppointment('2026-09-07T15:01:00Z', now)).toBe('2026-09-07T15:01:00.000Z');
  expect(new Date(minimumAppointmentTime(now)).getTime()).toBe(Date.parse('2026-09-07T15:01:00Z'));
});
