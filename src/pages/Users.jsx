import React, { useState, useEffect } from 'react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('petshop_token');
      const response = await fetch('https://manager-petshop.onrender.com/api/Auth', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const responseData = await response.json();
     
        const lista = responseData.data ? responseData.data : responseData;
        setUsers(Array.isArray(lista) ? lista : []);
      } else {
        setError('Erro ao carregar a lista de equipe.');
      }
    } catch (err) {
      setError('Falha na conexão com o servidor.');
    }
  };

  const handleDeleteUser = async (id, name) => {
    const confirmDelete = window.confirm(`PERIGO: Tem certeza que deseja remover permanentemente o acesso de ${name}?`);
    if (!confirmDelete) return;

    try {
      setError('');
      setSuccess('');
      const token = localStorage.getItem('petshop_token');
      
      const response = await fetch(`https://manager-petshop.onrender.com/api/Auth/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao remover usuário.');
      }

      setSuccess('Colaborador removido com sucesso!');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>👑 Controle de Acessos Corporativos</h2>

      {error && <p style={{ color: 'red', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>{error}</p>}
      {success && <p style={{ color: 'green', backgroundColor: '#d4edda', padding: '10px', borderRadius: '4px' }}>{success}</p>}

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Membros da Equipe</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Nome Completo</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Usuário (Username)</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>E-mail</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Cargo</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '15px', textAlign: 'center' }}>Nenhum usuário listado.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{user.fullName}</td>
                  <td style={{ padding: '12px' }}>{user.username}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: 'white',
                      backgroundColor: user.role === 'SuperAdmin' ? '#d35400' : user.role === 'Admin' ? '#f1c40f' : '#3498db'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDeleteUser(user.id, user.fullName)}
                      style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      🗑️ Deletar Conta
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}