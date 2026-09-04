import { useCallback, useState, useEffect } from 'react';
import { apiFetch } from '../services/apiFetch';

const STATUS_OPTIONS = [
  { value: 0, label: 'Agendado' },
  { value: 1, label: 'Concluído' },
  { value: 2, label: 'Cancelado' },
  { value: 3, label: 'Não Compareceu' },
];

const STATUS_COLORS = {
  0: '#3498db', // Agendado
  1: '#27ae60', // Concluído
  2: '#e74c3c', // Cancelado
  3: '#f39c12', // Não Compareceu
};

function getStatusLabel(status) {
  return STATUS_OPTIONS.find(s => s.value === status)?.label || 'Desconhecido';
}

function toDateTimeLocalValue(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);

  const [clientId, setClientId] = useState('');
  const [petId, setPetId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [appointmentDateTime, setAppointmentDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState(0);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await apiFetch('/api/appointments');

      if (response.ok) {
        const data = await response.json();
        setAppointments(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("A API retornou um erro:", response.status);
        setAppointments([]);
      }
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      setAppointments([]);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const response = await apiFetch('/api/Clients');
      if (response.ok) {
        const data = await response.json();
        setClients(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    }
  }, []);

  const fetchPets = useCallback(async () => {
    try {
      const response = await apiFetch('/api/pets');
      if (response.ok) {
        const data = await response.json();
        setPets(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      console.error("Erro ao buscar pets:", err);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const response = await apiFetch('/api/Services');
      if (response.ok) {
        const data = await response.json();
        setServices(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      console.error("Erro ao buscar serviços:", err);
    }
  }, []);

  const resetForm = () => {
    setClientId('');
    setPetId('');
    setServiceId('');
    setAppointmentDateTime('');
    setNotes('');
    setStatus(0);
    setEditingId(null);
  };

  const handleEditClick = (appointment) => {
    setEditingId(appointment.id);
    setClientId(String(appointment.client?.id ?? ''));
    setPetId(String(appointment.pet?.id ?? ''));
    setServiceId(String(appointment.service?.id ?? ''));
    setAppointmentDateTime(toDateTimeLocalValue(appointment.appointmentDateTime));
    setNotes(appointment.notes || '');
    setStatus(appointment.status);
    setError('');
    setSuccess('');
  };

  const handleCancelAppointment = async (id) => {
    const confirmCancel = window.confirm("Tem certeza que deseja cancelar este agendamento?");
    if (!confirmCancel) return;

    try {
      const response = await apiFetch(`/api/appointments/${id}/cancel`, { method: 'POST' });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao cancelar o agendamento.');
      }

      setSuccess('Agendamento cancelado com sucesso!');
      setError('');
      fetchAppointments();

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
      const path = isEditing ? `/api/appointments/${editingId}` : '/api/appointments';

      const body = isEditing
        ? {
            appointmentDateTime: new Date(appointmentDateTime).toISOString(),
            status: Number(status),
            notes
          }
        : {
            clientId: Number(clientId),
            petId: Number(petId),
            serviceId: Number(serviceId),
            appointmentDateTime: new Date(appointmentDateTime).toISOString(),
            notes
          };

      const response = await apiFetch(path, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erro ao ${isEditing ? 'atualizar' : 'criar'} agendamento.`);
      }

      setSuccess(`Agendamento ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
      resetForm();
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => {
      fetchAppointments();
      fetchClients();
      fetchPets();
      fetchServices();
    });
  }, [fetchAppointments, fetchClients, fetchPets, fetchServices]);

  const petsForSelectedClient = clientId
    ? pets.filter(p => String(p.clientId) === String(clientId))
    : [];

  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>📅 Gestão de Agendamentos</h2>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3>{editingId ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {!editingId && (
            <>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Cliente:</label>
                <select
                  value={clientId}
                  onChange={(e) => { setClientId(e.target.value); setPetId(''); }}
                  required
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                  <option value="">Selecione...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Pet:</label>
                <select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  required
                  disabled={!clientId}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                  <option value="">{clientId ? 'Selecione...' : 'Selecione um cliente primeiro'}</option>
                  {petsForSelectedClient.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Serviço:</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                  <option value="">Selecione...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Data e Hora:</label>
            <input
              type="datetime-local"
              value={appointmentDateTime}
              onChange={(e) => setAppointmentDateTime(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          {editingId && (
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ flex: '1 1 100%' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Observações:</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ flex: '1 1 100%', marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {loading ? 'Salvando...' : editingId ? '💾 Salvar Alterações' : '➕ Agendar'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Agendamentos</h3>
        <div className="table-scroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f6f9', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Data/Hora</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Cliente</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Pet</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Serviço</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '15px', textAlign: 'center' }}>Nenhum agendamento cadastrado ainda.</td></tr>
            ) : (
              appointments.map(appointment => (
                <tr key={appointment.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>
                    {appointment.appointmentDateTime
                      ? new Date(appointment.appointmentDateTime).toLocaleString('pt-BR')
                      : 'Não informado'}
                  </td>
                  <td style={{ padding: '12px' }}>{appointment.client?.name || 'Sem nome'}</td>
                  <td style={{ padding: '12px' }}>{appointment.pet?.name || 'Sem nome'}</td>
                  <td style={{ padding: '12px' }}>{appointment.service?.name || 'Sem nome'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: 'white',
                      backgroundColor: STATUS_COLORS[appointment.status] || '#7f8c8d'
                    }}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEditClick(appointment)}
                      style={{ padding: '6px 12px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' }}
                    >
                      ✏️ Editar
                    </button>
                    {appointment.status !== 2 && (
                      <button
                        onClick={() => handleCancelAppointment(appointment.id)}
                        style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        ✖️ Cancelar
                      </button>
                    )}
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
