import ManagementPage from "../components/ManagementPage";
import { PageCard, FormField, Button, Alert } from '../components/ui';
import DataTable from '../components/DataTable';
import { useCollection } from '../hooks/useCollection';
import { usePendingAction } from '../hooks/usePendingAction';
import { isAdmin } from '../services/session';
import { useState } from 'react';
import { apiFetch, getApiErrorMessage } from '../services/apiFetch';
import PhoneInput from '../components/PhoneInput';
import { validateClient } from '../utils/validation';

export default function Clients() {
  const clientsState = useCollection('/api/Clients');
  const { data: clients, reload: fetchClients } = clientsState;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setaddress] = useState('');

  const [loading, setLoading] = useState(false);
  const { pending, run } = usePendingAction();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDeleteClient = async (id) =>
    run(id, async () => {
      const confirmDelete = window.confirm(
        'Tem certeza que deseja excluir este cliente? Essa ação não pode ser desfeita.',
      );
      if (!confirmDelete) return;

      try {
        const response = await apiFetch(`/api/Clients/${id}`, { method: 'DELETE' });

        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, 'Erro ao excluir o cliente.'));
        }

        setSuccess('Cliente excluído com sucesso!');
        setError('');
        await fetchClients();
      } catch (err) {
        setError(err.message);
        setSuccess('');
      }
    });

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const client = validateClient({ name, phone, email, address });
      const response = await apiFetch('/api/Clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify(client),
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Erro ao cadastrar cliente.'));
      }

      setSuccess('Cliente cadastrado com sucesso!');

      setName('');
      setPhone('');
      setEmail('');
      setaddress('');

      await fetchClients();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ManagementPage kind="clients" embedded>

      <PageCard>
        <h3>Novo Cliente</h3>
        {error && <Alert>{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <form onSubmit={handleCreateClient} className="form-grid">
          <FormField label="Nome Completo:">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </FormField>
          <FormField label="Telefone:">
            <PhoneInput
              value={phone}
              onChange={setPhone}
              placeholder="(00) 00000-0000"
              required
            />
          </FormField>
          <FormField label="E-mail:">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@exemplo.com"
              autoComplete="email"
              required
            />
          </FormField>
          <FormField label="Endereço:">
            <input
              type="text"
              value={address}
              onChange={(e) => setaddress(e.target.value)}
              required
            />
          </FormField>

          <div className="form-actions">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : '➕ Adicionar Cliente'}
            </Button>
          </div>
        </form>
      </PageCard>

      <PageCard>
        <h3>Clientes Cadastrados</h3>
        <DataTable
          caption="Clientes cadastrados"
          rows={clients}
          {...clientsState}
          columns={[
            { key: 'name', label: 'Nome', value: (row) => row.name },
            { key: 'phone', label: 'Telefone', value: (row) => row.phone },
            { key: 'email', label: 'E-mail', value: (row) => row.email },
            { key: 'address', label: 'Endereço', value: (row) => row.address },
          ]}
          filter={{
            label: 'Endereço',
            options: [
              ...new Set(
                clients.map((row) => row.address).filter((value) => value != null && value !== ''),
              ),
            ].map((value) => ({ value: String(value), label: String(value) })),
            matches: (row, value) => String(row.address) === value,
          }}
          renderActions={(row) => (
            <>
              {isAdmin() && (
                <Button
                  variant="danger"
                  disabled={pending.has(row.id)}
                  onClick={() => handleDeleteClient(row.id)}
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
