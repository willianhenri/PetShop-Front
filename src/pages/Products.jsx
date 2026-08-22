import React, { useState, useEffect } from 'react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('petshop_token');
      const response = await fetch('https://manager-petshop.onrender.com/api/Products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("A API retornou um erro:", response.status);
        setProducts([]);
      }
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setProducts([]);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setStockQuantity('');
    setEditingId(null);
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setName(product.name || '');
    setDescription(product.description || '');
    setPrice(product.price ?? '');
    setStockQuantity(product.stockQuantity ?? '');
    setError('');
    setSuccess('');
  };

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este produto? Essa ação não pode ser desfeita.");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('petshop_token');

      const response = await fetch(`https://manager-petshop.onrender.com/api/Products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao excluir o produto.');
      }

      setSuccess('Produto excluído com sucesso!');
      setError('');
      fetchProducts();

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
      const token = localStorage.getItem('petshop_token');
      const url = isEditing
        ? `https://manager-petshop.onrender.com/api/Products/${editingId}`
        : 'https://manager-petshop.onrender.com/api/Products';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          stockQuantity: parseInt(stockQuantity, 10)
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} produto.`);
      }

      setSuccess(`Produto ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>📦 Gestão de Produtos</h2>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3>{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
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
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Estoque:</label>
            <input type="number" min="0" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1 1 100%' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Descrição:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ flex: '1 1 100%', marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {loading ? 'Salvando...' : editingId ? '💾 Salvar Alterações' : '➕ Adicionar Produto'}
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
        <h3>Produtos Cadastrados</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Descrição</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Preço</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Estoque</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '15px', textAlign: 'center' }}>Nenhum produto cadastrado ainda.</td></tr>
            ) : (
              products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{product.name || 'Sem nome'}</td>
                  <td style={{ padding: '12px' }}>{product.description || 'Não informado'}</td>
                  <td style={{ padding: '12px' }}>
                    {typeof product.price === 'number'
                      ? product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : 'Não informado'}
                  </td>
                  <td style={{ padding: '12px' }}>{product.stockQuantity ?? 'Não informado'}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEditClick(product)}
                      style={{ padding: '6px 12px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
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