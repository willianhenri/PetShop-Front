import { saveSession } from '../services/session';
import { FormField, Button, Alert } from '../components/ui';
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiFetch, getApiErrorMessage } from '../services/apiFetch';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiFetch('/api/Auth/login', {
        anonymous: true,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Usuário ou senha incorretos.'));
      }

      const data = await response.json();

      saveSession(data.token, data.role);

      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--login">
      <div className="auth-card">
        <h2>Acessar MeuPetShop</h2>
        {params.get('reason') === 'session-expired' && (
          <Alert>Sua sessão expirou. Entre novamente para continuar.</Alert>
        )}
        {params.get('reason') === 'password-reset' && (
          <Alert variant="success">Senha redefinida com sucesso. Entre com sua nova senha.</Alert>
        )}
        {error && <Alert>{error}</Alert>}

        <form onSubmit={handleLogin}>
          {/* Campo de Usuário */}
          <FormField label="Usuário (Username):">
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </FormField>

          {/* Campo de Senha */}
          <FormField label="Senha:">
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>

          {/* Botão Entrar */}
          <Button type="submit" disabled={loading}>
            {loading ? 'Carregando...' : 'Entrar'}
          </Button>
        </form>

        {/* Link Esqueceu a Senha */}
        <div>
          <Link to="/forgot-password">Esqueceu a senha?</Link>
        </div>
      </div>
    </div>
  );
}
