import React, { useState, useEffect } from 'react';

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [clients, setClients] = useState([]); 

  // Campos do Formulário
  const [clientId, setClientId] = useState(''); 
  const [name, setName] = useState('');
  const [breed, setBreed] = useState(''); 
  const [specie, setSpecie] = useState(''); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  useEffect(() => {
    fetchPets();
    fetchClients();
  }, []);

  const fetchPets = async () => {
    try {
      const token = localStorage.getItem('petshop_token');
      const response = await fetch('https://manager-petshop.onrender.com/api/Pets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const responseData = await response.json();
        
        setPets(Array.isArray(responseData.data) ? responseData.data : []);
      }
    } catch (err) {
      console.error("Erro ao buscar pets:", err);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('petshop_token');
      const response = await fetch('https://manager-petshop.onrender.com/api/Clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const responseData = await response.json();
        setClients(Array.isArray(responseData.data) ? responseData.data : []);
      }
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    }
  };

  const handleCreatePet = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!clientId) {
      setError('Por favor, selecione um dono para o pet.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('petshop_token');
      
      
      const response = await fetch(`https://manager-petshop.onrender.com/api/clients/${clientId}/pets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, breed, specie }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao cadastrar pet.');
      }

      setSuccess('Pet cadastrado com sucesso!');
      
      
      setName('');
      setBreed('');
      setSpecie('');
      setClientId('');
      
    
      fetchPets();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este pet?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('petshop_token');
      const response = await fetch(`https://manager-petshop.onrender.com/api/Pets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir o pet.');
      }

      setSuccess('Pet excluído com sucesso!');
      fetchPets(); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>🐶 Gestão de Pets</h2>

    
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3>Novo Pet</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        
        <form onSubmit={handleCreatePet} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          
       
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Dono do Pet:</label>
            <select 
              value={clientId} 
              onChange={(e) => setClientId(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            >
              <option value="">-- Selecione o Cliente --</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.phone})
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Nome do Pet:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Espécie (Ex: Cão, Gato):</label>
            <input type="text" value={specie} onChange={(e) => setSpecie(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Raça:</label>
            <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          
          <div style={{ flex: '1 1 100%', marginTop: '10px' }}>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {loading ? 'Salvando...' : '➕ Adicionar Pet'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Pets */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Pets Cadastrados</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Nome do Pet</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Espécie</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Raça</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pets.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '15px', textAlign: 'center' }}>Nenhum pet cadastrado ainda.</td></tr>
            ) : (
              pets.map(pet => (
                <tr key={pet.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{pet.name || 'Sem nome'}</td>
                  <td style={{ padding: '12px' }}>{pet.specie || 'Não informada'}</td>
                  <td style={{ padding: '12px' }}>{pet.breed || 'Não informada'}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDeletePet(pet.id)}
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