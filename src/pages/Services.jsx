import { useState, useEffect } from 'react';
import { apiFetch } from '../services/apiFetch';

export default function Services() {
  const [services, setServices] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationInMinutes, setDurationInMinutes] = useState('');

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchServices = async () => {
    try {
      const response = await apiFetch('/api/Services');

      if (response.ok) {
        const data = await response.json();
        setServices(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("A API retornou um erro:", response.status);
        setServices([]);
      }
    } catch (err) {
      console.error("Erro ao buscar serviços:", err);
      setServices([]);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchServices);
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setDurationInMinutes('');
    setEditingId(null);
  };

  const handleEditClick = (service) => {
    setEditingId(service.id);
    setName(service.name || '');
    setDescription(service.description || '');
    setPrice(service.price ?? '');
    setDurationInMinutes(service.durationInMinutes ?? '');
    setError('');
    setSuccess('');
  };

  const handleDeleteService = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este serviço? Essa ação não pode ser desfeita.");
    if (!confirmDelete) return;

    try {
      const response = await apiFetch(`/api/Services/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao excluir o serviço.');
      }

      setSuccess('Serviço excluído com sucesso!');
      setError('');
      fetchServices();

    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const isEditing = editingId !== null;

    try {
      const path = isEditing ? `/api/Services/${editingId}` : '/api/Services';

      const response = await apiFetch(path, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          durationInMinutes: parseInt(durationInMinutes, 10)
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} serviço.`);
      }

      setSuccess(`Serviço ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
      resetForm();
      fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>🛠️ Gestão de Serviços</h2>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3>{editingId ? 'Editar Serviço' : 'Novo Serviço'}</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Nome:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Preço (R$):</label>
            <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Duração (minutos):</label>
            <input type="number" min="0" value={durationInMinutes} onChange={(e) => setDurationInMinutes(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1 1 100%' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Descrição:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ flex: '1 1 100%', marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {loading ? 'Salvando...' : editingId ? '💾 Salvar Alterações' : '➕ Adicionar Serviço'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Serviços Cadastrados</h3>
        <div className="table-scroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Descrição</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Preço</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Duração</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '15px', textAlign: 'center' }}>Nenhum serviço cadastrado ainda.</td></tr>
            ) : (
              services.map(service => (
                <tr key={service.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{service.name || 'Sem nome'}</td>
                  <td style={{ padding: '12px' }}>{service.description || 'Não informado'}</td>
                  <td style={{ padding: '12px' }}>
                    {typeof service.price === 'number'
                      ? service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : 'Não informado'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {service.durationInMinutes != null ? `${service.durationInMinutes} min` : 'Não informado'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEditClick(service)}
                      style={{ padding: '6px 12px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
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
    </div>
  );
}
