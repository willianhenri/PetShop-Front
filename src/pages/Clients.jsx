import React, { useState, useEffect } from 'react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setaddress] = useState(''); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('petshop_token');
      const response = await fetch('https://manager-petshop.onrender.com/api/Clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
     
      if (response.ok) {
        const data = await response.json();
      
        setClients(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("A API retornou um erro:", response.status);
        setClients([]); 
      }
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      setClients([]); 
    }
  };


 const handleDeleteClient = async (id) => {
    
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este cliente? Essa ação não pode ser desfeita.");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('petshop_token');
      
      
      const response = await fetch(`https://manager-petshop.onrender.com/api/Clients/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao excluir o cliente.');
      }

      
      setSuccess('Cliente excluído com sucesso!');
      setError('');
      fetchClients(); 

    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('petshop_token');
      const response = await fetch('https://manager-petshop.onrender.com/api/Clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        
        body: JSON.stringify({ name, phone, email, address }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao cadastrar cliente.');
      }

      setSuccess('Cliente cadastrado com sucesso!');
      
      
      setName('');
      setPhone('');
      setEmail('');
      setaddress('');
      
    
      fetchClients();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>👥 Gestão de Clientes</h2>

     
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3>Novo Cliente</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        
        <form onSubmit={handleCreateClient} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Nome Completo:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Telefone:</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>E-mail:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Endereço:</label>
            <input type="text" value={address} onChange={(e) => setaddress(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          
          <div style={{ flex: '1 1 100%', marginTop: '10px' }}>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {loading ? 'Salvando...' : '➕ Adicionar Cliente'}
            </button>
          </div>
        </form>
      </div>

     
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Clientes Cadastrados</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Telefone</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>E-mail</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Endereço</th>
            </tr>
          </thead>
        <tbody>
          {clients.length === 0 ? (
            <tr><td colSpan="4" style={{ padding: '15px', textAlign: 'center' }}>Nenhum cliente cadastrado ainda.</td></tr>
          ) : (
            clients.map(client => (
              <tr key={client.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{client.name || 'Sem nome'}</td>
                <td style={{ padding: '12px' }}>{client.phone || 'Sem telefone'}</td>
                <td style={{ padding: '12px' }}>{client.email || 'Sem e-mail'}</td>
                <td style={{ padding: '12px' }}>{client.address || 'Não informado'}</td> 
                <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDeleteClient(client.id)}
                      style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      🗑️ Excluir
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