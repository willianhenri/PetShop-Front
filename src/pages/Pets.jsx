import { normalizeText } from '../utils/validation';
import { PageCard, FormField, Button, Alert, CollectionStatus } from '../components/ui';
import DataTable from '../components/DataTable';
import { useCollection } from '../hooks/useCollection';
import { usePendingAction } from '../hooks/usePendingAction';
import { isAdmin } from '../services/session';
import { useState } from 'react';
import { apiFetch, getApiErrorMessage } from '../services/apiFetch';

export default function Pets() {
  const petsState = useCollection('/api/Pets');
  const { data: pets, reload: fetchPets } = petsState;
  const clientsState = useCollection('/api/Clients');
  const { data: clients } = clientsState;

  // Campos do Formulário
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [specie, setSpecie] = useState('');

  const [loading, setLoading] = useState(false);
  const { pending, run } = usePendingAction();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      if (![name, breed, specie].every((value) => normalizeText(value)))
        throw new Error('Preencha nome, espécie e raça do pet.');
      const response = await apiFetch(`/api/clients/${clientId}/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: normalizeText(name),
          breed: normalizeText(breed),
          specie: normalizeText(specie),
        }),
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Erro ao cadastrar pet.'));
      }

      setSuccess('Pet cadastrado com sucesso!');

      setName('');
      setBreed('');
      setSpecie('');
      setClientId('');

      await fetchPets();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async (id) =>
    run(id, async () => {
      const confirmDelete = window.confirm('Tem certeza que deseja excluir este pet?');
      if (!confirmDelete) return;

      try {
        const response = await apiFetch(`/api/Pets/${id}`, { method: 'DELETE' });

        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, 'Erro ao excluir o pet.'));
        }

        setSuccess('Pet excluído com sucesso!');
        await fetchPets();
      } catch (err) {
        setError(err.message);
      }
    });

  return (
    <div>
      <h2 className="page-title">🐶 Gestão de Pets</h2>

      <PageCard>
        <h3>Novo Pet</h3>
        {error && <Alert>{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <CollectionStatus {...clientsState} />
        <form onSubmit={handleCreatePet} className="form-grid">
          <FormField label="Dono do Pet:">
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
              <option value="">-- Selecione o Cliente --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.phone})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Nome do Pet:">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </FormField>
          <FormField label="Espécie (Ex: Cão, Gato):">
            <input
              type="text"
              value={specie}
              onChange={(e) => setSpecie(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Raça:">
            <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} required />
          </FormField>

          <div className="form-actions">
            <Button
              type="submit"
              disabled={loading || clientsState.loading || Boolean(clientsState.error)}
            >
              {loading ? 'Salvando...' : '➕ Adicionar Pet'}
            </Button>
          </div>
        </form>
      </PageCard>

      {/* Tabela de Pets */}
      <PageCard>
        <h3>Pets Cadastrados</h3>
        <DataTable
          caption="Pets cadastrados"
          rows={pets}
          {...petsState}
          columns={[
            { key: 'name', label: 'Nome', value: (row) => row.name },
            { key: 'specie', label: 'Espécie', value: (row) => row.specie },
            { key: 'breed', label: 'Raça', value: (row) => row.breed },
          ]}
          filter={{
            label: 'Espécie',
            options: [
              ...new Set(
                pets.map((row) => row.specie).filter((value) => value != null && value !== ''),
              ),
            ].map((value) => ({ value: String(value), label: String(value) })),
            matches: (row, value) => String(row.specie) === value,
          }}
          renderActions={(row) => (
            <>
              {isAdmin() && (
                <Button
                  variant="danger"
                  disabled={pending.has(row.id)}
                  onClick={() => handleDeletePet(row.id)}
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
