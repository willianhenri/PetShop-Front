import ManagementPage from "../components/ManagementPage";
import { PageCard, Button, Alert } from '../components/ui';
import DataTable from '../components/DataTable';
import { useCollection } from '../hooks/useCollection';
import { usePendingAction } from '../hooks/usePendingAction';
import { useState } from 'react';
import { apiFetch, getApiErrorMessage } from '../services/apiFetch';

export default function Users() {
  const usersState = useCollection('/api/Auth');
  const { data: users, reload: fetchUsers } = usersState;
  const { pending, run } = usePendingAction();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDeleteUser = async (id, name) =>
    run(id, async () => {
      const confirmDelete = window.confirm(
        `PERIGO: Tem certeza que deseja remover permanentemente o acesso de ${name}?`,
      );
      if (!confirmDelete) return;

      try {
        setError('');
        setSuccess('');
        const response = await apiFetch(`/api/Auth/${id}`, { method: 'DELETE' });

        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, 'Erro ao remover usuário.'));
        }

        setSuccess('Colaborador removido com sucesso!');
        await fetchUsers();
      } catch (err) {
        setError(err.message);
      }
    });

  return (
    <ManagementPage kind="users" embedded>

      {error && <Alert>{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <PageCard>
        <h3>Membros da Equipe</h3>
        <DataTable
          caption="Membros da equipe"
          rows={users}
          {...usersState}
          columns={[
            { key: 'fullName', label: 'Nome completo', value: (row) => row.fullName },
            { key: 'username', label: 'Usuário', value: (row) => row.username },
            { key: 'email', label: 'E-mail', value: (row) => row.email },
            { key: 'role', label: 'Perfil', value: (row) => row.role },
          ]}
          filter={{
            label: 'Perfil',
            options: ['Funcionario', 'Admin', 'SuperAdmin'].map((value) => ({
              value,
              label: value,
            })),
            matches: (row, value) => row.role === value,
          }}
          renderActions={(row) => (
            <>
              <Button
                variant="danger"
                disabled={pending.has(row.id)}
                onClick={() => handleDeleteUser(row.id, row.fullName)}
              >
                {pending.has(row.id) ? 'Aguarde...' : 'Excluir'}
              </Button>
            </>
          )}
        />
      </PageCard>
    </ManagementPage>
  );
}
