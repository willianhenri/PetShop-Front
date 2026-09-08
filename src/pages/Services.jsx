import { nonNegativeNumber, normalizeText } from '../utils/validation';
import { PageCard, FormField, Button, Alert } from '../components/ui';
import DataTable from '../components/DataTable';
import { useCollection } from '../hooks/useCollection';
import { usePendingAction } from '../hooks/usePendingAction';
import { isAdmin } from '../services/session';
import { useState } from 'react';
import { apiFetch, getApiErrorMessage } from '../services/apiFetch';

export default function Services() {
  const servicesState = useCollection('/api/Services');
  const { data: services, reload: fetchServices } = servicesState;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationInMinutes, setDurationInMinutes] = useState('');

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const { pending, run } = usePendingAction();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleDeleteService = async (id) =>
    run(id, async () => {
      const confirmDelete = window.confirm(
        'Tem certeza que deseja excluir este serviço? Essa ação não pode ser desfeita.',
      );
      if (!confirmDelete) return;

      try {
        const response = await apiFetch(`/api/Services/${id}`, { method: 'DELETE' });

        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, 'Erro ao excluir o serviço.'));
        }

        setSuccess('Serviço excluído com sucesso!');
        if (editingId === id) resetForm();
        setError('');
        await fetchServices();
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
      const path = isEditing ? `/api/Services/${editingId}` : '/api/Services';

      const response = await apiFetch(path, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: normalizeText(name),
          description: normalizeText(description),
          price: nonNegativeNumber(price, 'Preço'),
          durationInMinutes: nonNegativeNumber(durationInMinutes, 'Duração', true),
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} serviço.`,
          ),
        );
      }

      setSuccess(`Serviço ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`);
      resetForm();
      await fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">🛠️ Gestão de Serviços</h2>

      <PageCard>
        <h3>{editingId ? 'Editar Serviço' : 'Novo Serviço'}</h3>
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
          <FormField label="Duração (minutos):">
            <input
              type="number"
              min="0"
              value={durationInMinutes}
              onChange={(e) => setDurationInMinutes(e.target.value)}
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
                  : '➕ Adicionar Serviço'}
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
        <h3>Serviços Cadastrados</h3>
        <DataTable
          caption="Serviços cadastrados"
          rows={services}
          {...servicesState}
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
            {
              key: 'durationInMinutes',
              label: 'Duração (min)',
              value: (row) => row.durationInMinutes,
            },
          ]}
          filter={{
            label: 'Duração (min)',
            options: [
              ...new Set(
                services
                  .map((row) => row.durationInMinutes)
                  .filter((value) => value != null && value !== ''),
              ),
            ].map((value) => ({ value: String(value), label: String(value) })),
            matches: (row, value) => String(row.durationInMinutes) === value,
          }}
          renderActions={(row) => (
            <>
              <Button
                variant="secondary"
                disabled={pending.has(row.id) || loading}
                onClick={() => handleEditClick(row)}
              >
                Editar
              </Button>
              {isAdmin() && (
                <Button
                  variant="danger"
                  disabled={pending.has(row.id)}
                  onClick={() => handleDeleteService(row.id)}
                >
                  {pending.has(row.id) ? 'Aguarde...' : 'Excluir'}
                </Button>
              )}
            </>
          )}
        />
      </PageCard>
    </div>
  );
}
