import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const response = await fetch('https://manager-petshop.onrender.com/api/Auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, fullName }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao registrar usuário.');
      }

      setSuccess('Novo usuário cadastrado com sucesso!');
      setFullName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <button onClick={() => navigate('/home')} style={{ marginBottom: '20px', padding: '5px 10px' }}>← Voltar ao Painel</button>
      <div style={{ border: '1px solid #ccc', padding: '30px', borderRadius: '8px', width: '400px' }}>
        <h2>Cadastrar Novo Colaborador (Admin)</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block' }}>Nome Completo:</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block' }}>Nome de Usuário:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block' }}>E-mail corporativo:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block' }}>Senha Provisória:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Salvando...' : 'Confirmar Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
}