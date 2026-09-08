import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, getApiErrorMessage } from '../services/apiFetch';
import { Alert, Button, FormField } from '../components/ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await apiFetch('/api/auth/forgot-password', {
        anonymous: true,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!response.ok)
        throw new Error(
          await getApiErrorMessage(response, 'Erro ao solicitar a recuperação. Tente novamente.'),
        );
      setSuccess('Se o e-mail existir na nossa base, um link de recuperação será enviado.');
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="auth-page">
      <div className="auth-card">
        <h2>Esqueci minha senha</h2>
        <p>Digite seu e-mail cadastrado para solicitar a redefinição de senha.</p>
        <Alert>{error}</Alert>
        <Alert variant="success">{success}</Alert>
        <form onSubmit={handleSubmit}>
          <FormField label="E-mail">
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>
          <Button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar solicitação'}
          </Button>
        </form>
        <p>
          <Link to="/login">Voltar ao login</Link>
        </p>
      </div>
    </main>
  );
}
