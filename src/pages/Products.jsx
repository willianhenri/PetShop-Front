import ManagementPage from "../components/ManagementPage";
import { nonNegativeNumber, normalizeText } from '../utils/validation';
import { PageCard, FormField, Button, Alert } from '../components/ui';
import DataTable from '../components/DataTable';
import { useCollection } from '../hooks/useCollection';
import { usePendingAction } from '../hooks/usePendingAction';
import { isAdmin } from '../services/session';
import { useState } from 'react';
import { apiFetch, getApiErrorMessage } from '../services/apiFetch';

export default function Products() {
  const productsState = useCollection('/api/Products');
  const { data: products, reload: fetchProducts } = productsState;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const { pending, run } = usePendingAction();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleDeleteProduct = async (id) =>
    run(id, async () => {
      const confirmDelete = window.confirm(
        'Tem certeza que deseja excluir este produto? Essa ação não pode ser desfeita.',
      );
      if (!confirmDelete) return;

      try {
        const response = await apiFetch(`/api/Products/${id}`, { method: 'DELETE' });

        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, 'Erro ao excluir o produto.'));
        }

        setSuccess('Produto excluído com sucesso!');
        if (editingId === id) resetForm();
        setError('');
        await fetchProducts();
      } catch (err) {
        setError(err.message);
        setSuccess('');
      }
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const isEditing = editingId !== null;

    try {
      if (!normalizeText(name)) throw new Error('Preencha o nome.');
      const path = isEditing ? `/api/Products/${editingId}` : '/api/Products';

      const response = await apiFetch(path, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: normalizeText(name),
          description: normalizeText(description),
          price: nonNegativeNumber(price, 'Preço'),
          stockQuantity: nonNegativeNumber(stockQuantity, 'Estoque', true),
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} produto.`,
          ),
        );
      }

      setSuccess(`Produto ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
      resetForm();
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ManagementPage kind="products" embedded>

      <PageCard>
        <h3>{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
        {error && <Alert>{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <form onSubmit={handleSubmit} className="form-grid">
          <FormField label="Nome:">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </FormField>
          <FormField label="Preço (R$):">
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Estoque:">
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Descrição:">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </FormField>

          <div className="form-actions">
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Salvando...'
                : editingId
                  ? '💾 Salvar Alterações'
                  : '➕ Adicionar Produto'}
            </Button>
            {editingId && (
              <Button variant="secondary" type="button" disabled={loading} onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </PageCard>

      <PageCard>
        <h3>Produtos Cadastrados</h3>
        <DataTable
          caption="Produtos cadastrados"
          rows={products}
          {...productsState}
          columns={[
            { key: 'name', label: 'Nome', value: (row) => row.name },
            { key: 'description', label: 'Descrição', value: (row) => row.description },
            {
              key: 'price',
              label: 'Preço',
              value: (row) => row.price,
              render: (row) =>
                typeof row.price === 'number'
                  ? row.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : 'Não informado',
            },
            { key: 'stockQuantity', label: 'Estoque', value: (row) => row.stockQuantity },
          ]}
          filter={{
            label: 'Estoque',
            options: [
              { value: 'low', label: 'Baixo (até 5)' },
              { value: 'available', label: 'Acima de 5' },
            ],
            matches: (row, value) =>
              value === 'low' ? row.stockQuantity <= 5 : row.stockQuantity > 5,
          }}
          renderActions={(row) => (
            <>
              {isAdmin() && (
                <Button
                  variant="secondary"
                  disabled={pending.has(row.id) || loading}
                  onClick={() => handleEditClick(row)}
                >
                  Editar
                </Button>
              )}
              {isAdmin() && (
                <Button
                  variant="danger"
                  disabled={pending.has(row.id)}
                  onClick={() => handleDeleteProduct(row.id)}
                >
                  {pending.has(row.id) ? 'Aguarde...' : 'Excluir'}
                </Button>
              )}
            </>
          )}
        />
      </PageCard>
    </ManagementPage>
  );
}
