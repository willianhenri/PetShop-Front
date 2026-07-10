import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://manager-petshop.onrender.com/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Usuário ou senha incorretos.');
      }

      const data = await response.json();
      
      localStorage.setItem('petshop_token', data.token);
      localStorage.setItem('petshop_role', data.role);

      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Arial', backgroundColor: '#0a192f' }}>
      <style>{`
        body {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #0a192f;
        }
      `}</style>
      <div style={{ border: '1px solid #233554', padding: '30px', borderRadius: '8px', width: '350px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', backgroundColor: '#112240', color: '#ffffff' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Acessar MeuPetShop</h2>
        {error && <p style={{ color: '#ff6b6b', fontSize: '14px' }}>{error}</p>}
        
        <form onSubmit={handleLogin}>
          {/* Campo de Usuário */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ccd6f6' }}>Usuário (Username):</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', backgroundColor: '#172a45', border: '1px solid #233554', color: '#ffffff', borderRadius: '4px' }} 
            />
          </div>

          {/* Campo de Senha */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ccd6f6' }}>Senha:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', backgroundColor: '#172a45', border: '1px solid #233554', color: '#ffffff', borderRadius: '4px' }} 
            />
          </div>

          {/* Botão Entrar */}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            {loading ? 'Carregando...' : 'Entrar'}
          </button>
        </form>

        {/* Link Esqueceu a Senha */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          <Link to="/forgot-password" style={{ color: '#64ffda', textDecoration: 'none' }}>Esqueceu a senha?</Link>
        </div>
      </div>
    </div>
  );
}