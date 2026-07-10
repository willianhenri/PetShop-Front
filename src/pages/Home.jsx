import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const role = localStorage.getItem('petshop_role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h1>🐾 MeuPetShop - Painel</h1>
        <div>
          
          {role === 'Admin' && (
            <button onClick={() => navigate('/register')} style={{ marginRight: '10px', padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              ⚙️ Cadastrar Novo Usuário
            </button>
          )}
          <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </header>
      
      <main style={{ marginTop: '20px' }}>
        <h3>Bem-vindo ao sistema interno!</h3>
        <p>Seu nível de acesso atual é: <strong>{role}</strong></p>
      </main>
    </div>
  );
}