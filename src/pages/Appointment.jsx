import { minimumAppointmentTime, validateAppointment } from '../utils/validation';
import { PageCard, FormField, Button, Alert, CollectionStatus } from '../components/ui';
import DataTable from '../components/DataTable';
import { useCollection } from '../hooks/useCollection';
import { usePendingAction } from '../hooks/usePendingAction';
import { useState } from 'react';
import { apiFetch, getApiErrorMessage } from '../services/apiFetch';

const STATUS_OPTIONS = [
  { value: 0, label: 'Agendado' },
  { value: 1, label: 'Concluído' },
  { value: 2, label: 'Cancelado' },
  { value: 3, label: 'Não Compareceu' },
];

function getStatusLabel(status) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label || 'Desconhecido';
}

function toDateTimeLocalValue(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function Appointments() {
  const appointmentsState = useCollection('/api/appointments');
  const { data: appointments, reload: fetchAppointments } = appointmentsState;
  const clientsState = useCollection('/api/Clients');
  const { data: clients } = clientsState;
  const petsState = useCollection('/api/Pets');
  const { data: pets } = petsState;
  const servicesState = useCollection('/api/Services');
  const { data: services } = servicesState;

  const [clientId, setClientId] = useState('');
  const [petId, setPetId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [appointmentDateTime, setAppointmentDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState(0);

  const [editingId, setEditingId] = useState(null);
  const [originalDateTime, setOriginalDateTime] = useState('');

  const [loading, setLoading] = useState(false);
  const { pending, run } = usePendingAction();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setClientId('');
    setPetId('');
    setServiceId('');
    setAppointmentDateTime('');
    setNotes('');
    setStatus(0);
    setEditingId(null);
    setOriginalDateTime('');
  };

  const handleEditClick = (appointment) => {
    setEditingId(appointment.id);
    setOriginalDateTime(appointment.appointmentDateTime);
    setClientId(String(appointment.client?.id ?? ''));
    setPetId(String(appointment.pet?.id ?? ''));
    setServiceId(String(appointment.service?.id ?? ''));
    setAppointmentDateTime(toDateTimeLocalValue(appointment.appointmentDateTime));
    setNotes(appointment.notes || '');
    setStatus(appointment.status);
    setError('');
    setSuccess('');
  };

  const handleCancelAppointment = async (id) =>
    run(id, async () => {
      const confirmCancel = window.confirm('Tem certeza que deseja cancelar este agendamento?');
      if (!confirmCancel) return;

      try {
        const response = await apiFetch(`/api/appointments/${id}/cancel`, { method: 'POST' });

        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, 'Erro ao cancelar o agendamento.'));
        }

        setSuccess('Agendamento cancelado com sucesso!');
        if (editingId === id) resetForm();
        setError('');
        await fetchAppointments();
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
      // Updating notes/status must not force rescheduling an existing past visit.
      const dateTime =
        isEditing && appointmentDateTime === toDateTimeLocalValue(originalDateTime)
          ? originalDateTime
          : validateAppointment(appointmentDateTime);
      if (
        !isEditing &&
        (!clients.some((item) => String(item.id) === clientId) ||
          !petsForSelectedClient.some((item) => String(item.id) === petId) ||
          !services.some((item) => String(item.id) === serviceId))
      ) {
        throw new Error('Selecione cliente, pet e serviço válidos.');
      }
      const path = isEditing ? `/api/appointments/${editingId}` : '/api/appointments';

      const body = isEditing
        ? {
            appointmentDateTime: dateTime,
            status: Number(status),
            notes,
          }
        : {
            clientId: Number(clientId),
            petId: Number(petId),
            serviceId: Number(serviceId),
            appointmentDateTime: dateTime,
            notes,
          };

      const response = await apiFetch(path, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            `Erro ao ${isEditing ? 'atualizar' : 'criar'} agendamento.`,
          ),
        );
      }

      setSuccess(`Agendamento ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      resetForm();
      await fetchAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const petsForSelectedClient = clientId
    ? pets.filter((p) => String(p.clientId) === String(clientId))
    : [];

  return (
    <div>
      <h2 className="page-title">📅 Gestão de Agendamentos</h2>

      <PageCard>
        <h3>{editingId ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
        {error && <Alert>{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <CollectionStatus {...clientsState} />
        <CollectionStatus {...petsState} />
        <CollectionStatus {...servicesState} />
        <form onSubmit={handleSubmit} className="form-grid">
          {!editingId && (
            <>
              <FormField label="Cliente:">
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setPetId('');
                  }}
                  required
                >
                  <option value="">Selecione...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Pet:">
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  required
                  disabled={!clientId}
                >
                  <option value="">
                    {clientId ? 'Selecione...' : 'Selecione um cliente primeiro'}
                  </option>
                  {petsForSelectedClient.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Serviço:">
                <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
                  <option value="">Selecione...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </>
          )}

          <FormField label="Data e Hora:" hint="Escolha uma data e hora futuras.">
            <input
              type="datetime-local"
              min={
                editingId !== null && appointmentDateTime === toDateTimeLocalValue(originalDateTime)
                  ? undefined
                  : minimumAppointmentTime()
              }
              value={appointmentDateTime}
              onChange={(e) => setAppointmentDateTime(e.target.value)}
              required
            />
          </FormField>

          {editingId && (
            <FormField label="Status:">
              <select value={status} onChange={(e) => setStatus(Number(e.target.value))}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          <FormField label="Observações:">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </FormField>

          <div className="form-actions">
            <Button
              type="submit"
              disabled={
                loading ||
                clientsState.loading ||
                Boolean(clientsState.error) ||
                petsState.loading ||
                Boolean(petsState.error) ||
                servicesState.loading ||
                Boolean(servicesState.error)
              }
            >
              {loading ? 'Salvando...' : editingId ? '💾 Salvar Alterações' : '➕ Agendar'}
            </Button>
            {editingId && (
              <Button variant="secondary" type="button" disabled={loading} onClick={resetForm}>
                Cancelar Edição
              </Button>
            )}
          </div>
        </form>
      </PageCard>

      <PageCard>
        <h3>Agendamentos</h3>
        <DataTable
          caption="Agendamentos"
          rows={appointments}
          {...appointmentsState}
          columns={[
            {
              key: 'appointmentDateTime',
              label: 'Data/hora',
              value: (row) => row.appointmentDateTime,
              render: (row) => new Date(row.appointmentDateTime).toLocaleString('pt-BR'),
            },
            { key: 'client?.name', label: 'Cliente', value: (row) => row.client?.name },
            { key: 'pet?.name', label: 'Pet', value: (row) => row.pet?.name },
            { key: 'service?.name', label: 'Serviço', value: (row) => row.service?.name },
            { key: 'status', label: 'Status', value: (row) => getStatusLabel(row.status) },
          ]}
          filter={{
            label: 'Status',
            options: STATUS_OPTIONS.map((item) => ({ ...item, value: String(item.value) })),
            matches: (row, value) => String(row.status) === value,
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
              {row.status !== 2 && (
                <Button
                  variant="danger"
                  disabled={pending.has(row.id)}
                  onClick={() => handleCancelAppointment(row.id)}
                >
                  {pending.has(row.id) ? 'Aguarde...' : 'Cancelar'}
                </Button>
              )}
            </>
          )}
        />
      </PageCard>
    </div>
  );
}
