import ManagementPage from "../components/ManagementPage";
import { useSearchParams } from "react-router-dom";
import { useCallback, useState, useEffect } from "react";
import { apiFetch, getApiErrorMessage } from "../services/apiFetch";

const STATUS_OPTIONS = [
  { value: 0, label: "Agendado" },
  { value: 1, label: "Concluído" },
  { value: 2, label: "Cancelado" },
  { value: 3, label: "Não Compareceu" },
];

const STATUS_COLORS = {
  0: "#3498db", // Agendado
  1: "#27ae60", // Concluído
  2: "#e74c3c", // Cancelado
  3: "#f39c12", // Não Compareceu
};

function getStatusLabel(status) {
  return (
    STATUS_OPTIONS.find((s) => s.value === status)?.label || "Desconhecido"
  );
}

function toDateTimeLocalValue(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function Appointments() {
  const [searchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(searchParams.get("new") === "1");
  const [localQuery, setLocalQuery] = useState(null);
  const query = localQuery ?? searchParams.get("q") ?? "";
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);

  const [clientId, setClientId] = useState("");
  const [petId, setPetId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [appointmentDateTime, setAppointmentDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState(0);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await apiFetch("/api/appointments");

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
      const response = await apiFetch("/api/Clients");
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
      const response = await apiFetch("/api/pets");
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
      const response = await apiFetch("/api/Services");
      if (response.ok) {
        const data = await response.json();
        setServices(Array.isArray(data.data) ? data.data : []);
      }
    } catch (err) {
      console.error("Erro ao buscar serviços:", err);
    }
  }, []);

  const resetForm = () => {
    setClientId("");
    setPetId("");
    setServiceId("");
    setAppointmentDateTime("");
    setNotes("");
    setStatus(0);
    setEditingId(null);
  };

  const handleEditClick = (appointment) => {
    setFormOpen(true);
    setEditingId(appointment.id);
    setClientId(String(appointment.client?.id ?? ""));
    setPetId(String(appointment.pet?.id ?? ""));
    setServiceId(String(appointment.service?.id ?? ""));
    setAppointmentDateTime(
      toDateTimeLocalValue(appointment.appointmentDateTime),
    );
    setNotes(appointment.notes || "");
    setStatus(appointment.status);
    setError("");
    setSuccess("");
  };

  const handleCancelAppointment = async (id) => {
    const confirmCancel = window.confirm(
      "Tem certeza que deseja cancelar este agendamento?",
    );
    if (!confirmCancel) return;

    try {
      const response = await apiFetch(`/api/appointments/${id}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Erro ao cancelar o agendamento."),
        );
      }

      setSuccess("Agendamento cancelado com sucesso!");
      setError("");
      fetchAppointments();
    } catch (err) {
      setError(err.message);
      setSuccess("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const isEditing = editingId !== null;

    try {
      const path = isEditing
        ? `/api/appointments/${editingId}`
        : "/api/appointments";

      const body = isEditing
        ? {
            appointmentDateTime: new Date(appointmentDateTime).toISOString(),
            status: Number(status),
            notes,
          }
        : {
            clientId: Number(clientId),
            petId: Number(petId),
            serviceId: Number(serviceId),
            appointmentDateTime: new Date(appointmentDateTime).toISOString(),
            notes,
          };

      const response = await apiFetch(path, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            `Erro ao ${isEditing ? "atualizar" : "criar"} agendamento.`,
          ),
        );
      }

      setSuccess(
        `Agendamento ${isEditing ? "atualizado" : "criado"} com sucesso!`,
      );
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
    ? pets.filter((p) => String(p.clientId) === String(clientId))
    : [];

  const filtered = appointments.filter((item) =>
    JSON.stringify(item)
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );

  return (
    <ManagementPage
      kind="appointments"
      formOpen={formOpen}
      setFormOpen={setFormOpen}
      query={query}
      setQuery={setLocalQuery}
      count={filtered.length}
    >
      {error && (
        <p className="feedback error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="feedback success" role="status">
          {success}
        </p>
      )}

      <div className="panel form-panel entity-form">
        <h3>{editingId ? "Editar Agendamento" : "Novo Agendamento"}</h3>

        <form onSubmit={handleSubmit} className="form-grid">
          {!editingId && (
            <>
              <div>
                <label htmlFor="appointment-field-1">Cliente:</label>
                <select
                  id="appointment-field-1"
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setPetId("");
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
              </div>
              <div>
                <label htmlFor="appointment-field-2">Pet:</label>
                <select
                  id="appointment-field-2"
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  required
                  disabled={!clientId}
                >
                  <option value="">
                    {clientId
                      ? "Selecione..."
                      : "Selecione um cliente primeiro"}
                  </option>
                  {petsForSelectedClient.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="appointment-field-3">Serviço:</label>
                <select
                  id="appointment-field-3"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label htmlFor="appointment-field-4">Data e Hora:</label>
            <input
              id="appointment-field-4"
              type="datetime-local"
              value={appointmentDateTime}
              onChange={(e) => setAppointmentDateTime(e.target.value)}
              required
            />
          </div>

          {editingId && (
            <div>
              <label htmlFor="appointment-field-5">Status:</label>
              <select
                id="appointment-field-5"
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-full">
            <label htmlFor="appointment-field-6">Observações:</label>
            <textarea
              id="appointment-field-6"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-full">
            <button type="submit" disabled={loading} className="primary-button">
              {loading
                ? "Salvando..."
                : editingId
                  ? " Salvar Alterações"
                  : " Agendar"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="secondary-button"
              >
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Cliente</th>
                <th>Pet</th>
                <th>Serviço</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6">Nenhum agendamento cadastrado ainda.</td>
                </tr>
              ) : (
                filtered.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>
                      {appointment.appointmentDateTime
                        ? new Date(
                            appointment.appointmentDateTime,
                          ).toLocaleString("pt-BR")
                        : "Não informado"}
                    </td>
                    <td>{appointment.client?.name || "Sem nome"}</td>
                    <td>{appointment.pet?.name || "Sem nome"}</td>
                    <td>{appointment.service?.name || "Sem nome"}</td>
                    <td>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "white",
                          backgroundColor:
                            STATUS_COLORS[appointment.status] || "#7f8c8d",
                        }}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEditClick(appointment)}
                        className="secondary-button"
                      >
                        Editar
                      </button>
                      {appointment.status !== 2 && (
                        <button
                          onClick={() =>
                            handleCancelAppointment(appointment.id)
                          }
                          className="danger-button"
                        >
                          Cancelar
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
    </ManagementPage>
  );
}
