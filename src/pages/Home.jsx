import React from 'react';

export default function Home() {
  const role = localStorage.getItem('petshop_role');

  return (
    <div>
      <h1 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>Painel de Controle</h1>
      <p>Bem-vindo ao sistema interno! Seu nível de acesso atual é: <strong>{role}</strong></p>
      
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
         <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1 }}>
            <h3>Consultas Hoje</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>0</p>
         </div>
         <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1 }}>
            <h3>Novos Clientes</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ecc71' }}>0</p>
         </div>
      </div>
    </div>
  );
}