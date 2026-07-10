import React, { useState, useEffect } from 'react';

export default function Home() {
  const role = localStorage.getItem('petshop_role');
  const [totalClients, setTotalClients] = useState(0);
  const roleScreen = role === 'Admin' ? 'Administrador' : 'Funcionário';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('petshop_token');
      
      
      const response = await fetch('https://manager-petshop.onrender.com/api/Clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const responseData = await response.json();
        
        
        if (responseData.pagination && responseData.pagination.totalCount !== undefined) {
          setTotalClients(responseData.pagination.totalCount);
        } else if (Array.isArray(responseData.data)) {
          
          setTotalClients(responseData.data.length);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar dados do dashboard:", err);
    }
  };

  return (
    <div>
      <h1 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>Painel de Controle</h1>
      <p>Bem-vindo ao sistema interno! Seu nível de acesso atual é: <strong>{roleScreen}</strong></p>
      
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
         <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1 }}>
            <h3>Consultas Hoje</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>0</p>
         </div>
         <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1 }}>
            <h3>Total de Clientes</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ecc71' }}>{totalClients}</p>
         </div>
      </div>
    </div>
  );
}