import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  

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
      const token = localStorage.getItem('petshop_token');

      const response = await fetch('https://manager-petshop.onrender.com/api/Auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
 
        body: JSON.stringify({ username, email, password, fullName, role }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao registrar usuário.');
      }

      setSuccess('Novo usuário cadastrado com sucesso!');
      
    
      setFullName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('Funcionario');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <button onClick={() => navigate('/home')} style={{ marginBottom: '20px', padding: '5px 10px' }}>← Voltar ao Painel</button>
      <div style={{ border: '1px solid #ccc', padding: '30px', borderRadius: '8px', width: '400px', backgroundColor: 'white' }}>
        <h2>Cadastrar Novo Colaborador</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nome Completo:</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nome de Usuário:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>E-mail corporativo:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Senha Provisória:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nível de Acesso (Perfil):</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: '#f8f9fa' }}
            >
              <option value="Funcionario">Funcionário Comum</option>
              <option value="Admin">Administrador (Total)</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Salvando...' : 'Confirmar Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
}