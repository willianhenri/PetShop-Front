import { validatePassword } from '../utils/validation';
import { FormField, Button, Alert } from '../components/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, getApiErrorMessage } from '../services/apiFetch';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [role, setRole] = useState('Funcionario');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      validatePassword(password, confirmPassword);
      if (!fullName.trim() || !username.trim()) throw new Error('Preencha nome e usuário.');
      const response = await apiFetch('/api/Auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim().replace(/\s+/g, ' '),
          role,
        }),
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Erro ao registrar usuário.'));
      }

      setSuccess('Novo usuário cadastrado com sucesso!');

      setFullName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('Funcionario');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Button onClick={() => navigate('/home')}>← Voltar ao Painel</Button>
      <div className="register-card">
        <h2>Cadastrar Novo Colaborador</h2>
        {error && <Alert>{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <form onSubmit={handleRegister}>
          <FormField label="Nome Completo:">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Nome de Usuário:">
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </FormField>

          <FormField label="E-mail corporativo:">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FormField>

          <FormField
            label="Senha Provisória:"
            hint="Use pelo menos 8 caracteres. Prefira uma frase longa e única, com letras, números e símbolos."
          >
            <input
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Confirmar senha:">
            <input
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Nível de Acesso (Perfil):">
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="Funcionario">Funcionário Comum</option>
              <option value="Admin">Administrador (Total)</option>
            </select>
          </FormField>

          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Confirmar Cadastro'}
          </Button>
        </form>
      </div>
    </div>
  );
}
