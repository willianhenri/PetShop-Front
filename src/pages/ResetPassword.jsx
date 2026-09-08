import { validatePassword } from '../utils/validation';
import { FormField, Button, Alert } from '../components/ui';
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch, getApiErrorMessage } from '../services/apiFetch';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tokenBody = searchParams.get('token');
  const token = tokenBody ? tokenBody.replace(/ /g, '+') : null;

  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const invalidResetLink = !token || !email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (invalidResetLink) return;
    setLoading(true);

    try {
      validatePassword(password, confirmPassword);
      const response = await apiFetch('/api/auth/reset-password', {
        anonymous: true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          token: token,
          newPassword: password,
        }),
      });
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Erro ao redefinir a senha.'));
      }

      navigate('/login?reason=password-reset', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Redefinir Senha</h2>
        <p>Digite sua nova senha abaixo para acessar o MeuPetShop.</p>

        {(error || invalidResetLink) && (
          <Alert>{error || 'Link de recuperação inválido ou expirado.'}</Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormField
            label="Nova Senha:"
            hint="Use pelo menos 8 caracteres. Prefira uma frase longa e única, com letras, números e símbolos."
          >
            <input
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || invalidResetLink}

              required
            />
          </FormField>

          <FormField label="Confirmar Nova Senha:">
            <input
              type="password"
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || invalidResetLink}

              required
            />
          </FormField>

          <Button type="submit" disabled={loading || invalidResetLink}>
            {loading ? 'Alterando...' : 'Salvar Nova Senha'}
          </Button>
        </form>
      </div>
    </div>
  );
}
