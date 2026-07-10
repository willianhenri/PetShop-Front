import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem('petshop_role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const linkStyle = {
    display: 'block',
    padding: '12px 20px',
    color: '#ecf0f1',
    textDecoration: 'none',
    borderBottom: '1px solid #34495e',
    transition: 'background 0.3s'
  };

  return (
    <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0 }}>
      <div style={{ padding: '20px', backgroundColor: '#1a252f', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>
        🐾 MeuPetShop
      </div>

      
      <nav style={{ flex: 1, marginTop: '10px' }}>
        <Link to="/home" style={linkStyle}> Home</Link>
        <Link to="/clientes" style={linkStyle}> Clientes</Link>
        <Link to="/pets" style={linkStyle}> Pets</Link>
        
       
        <Link to="/agenda" style={linkStyle}> Agenda</Link>
        <Link to="/servicos" style={linkStyle}> Serviços</Link>
        <Link to="/produtos" style={linkStyle}> Produtos</Link>
        
       
        {(role === 'Admin' || role === 'SuperAdmin') && (
          <Link to="/register" style={{ ...linkStyle, backgroundColor: '#27ae60' }}> Registrar Funcionário</Link>
        )}

        
        {role === 'SuperAdmin' && (
          <Link to="/usuarios" style={{ ...linkStyle, backgroundColor: '#8e44ad' }}> Gerenciar Equipe</Link>
        )}
      </nav>

      <div style={{ padding: '20px', borderTop: '1px solid #34495e' }}>
        <button onClick={handleLogout} style={{ width: '100%', padding: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sair do Sistema
        </button>
      </div>
    </div>
  );
}