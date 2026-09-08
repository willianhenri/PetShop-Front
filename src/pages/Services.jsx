import ManagementPage from "../components/ManagementPage";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiFetch, getApiErrorMessage } from "../services/apiFetch";

export default function Services() {
  const [searchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(searchParams.get("new") === "1");
  const [localQuery, setLocalQuery] = useState(null);
  const query = localQuery ?? searchParams.get("q") ?? "";
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationInMinutes, setDurationInMinutes] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchServices = async () => {
    try {
      const response = await apiFetch("/api/Services");

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
    setName("");
    setDescription("");
    setPrice("");
    setDurationInMinutes("");
    setEditingId(null);
  };

  const handleEditClick = (service) => {
    setFormOpen(true);
    setEditingId(service.id);
    setName(service.name || "");
    setDescription(service.description || "");
    setPrice(service.price ?? "");
    setDurationInMinutes(service.durationInMinutes ?? "");
    setError("");
    setSuccess("");
  };

  const handleDeleteService = async (id) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este serviço? Essa ação não pode ser desfeita.",
    );
    if (!confirmDelete) return;

    try {
      const response = await apiFetch(`/api/Services/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Erro ao excluir o serviço."),
        );
      }

      setSuccess("Serviço excluído com sucesso!");
      setError("");
      fetchServices();
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
      const path = isEditing ? `/api/Services/${editingId}` : "/api/Services";

      const response = await apiFetch(path, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          durationInMinutes: parseInt(durationInMinutes, 10),
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            `Erro ao ${isEditing ? "atualizar" : "cadastrar"} serviço.`,
          ),
        );
      }

      setSuccess(
        `Serviço ${isEditing ? "atualizado" : "cadastrado"} com sucesso!`,
      );
      resetForm();
      fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = services.filter((item) =>
    JSON.stringify(item)
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );

  return (
    <ManagementPage
      kind="services"
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
        <h3>{editingId ? "Editar Serviço" : "Novo Serviço"}</h3>

        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <label htmlFor="services-field-1">Nome:</label>
            <input
              id="services-field-1"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="services-field-2">Preço (R$):</label>
            <input
              id="services-field-2"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="services-field-3">Duração (minutos):</label>
            <input
              id="services-field-3"
              type="number"
              min="0"
              value={durationInMinutes}
              onChange={(e) => setDurationInMinutes(e.target.value)}
              required
            />
          </div>
          <div className="form-full">
            <label htmlFor="services-field-4">Descrição:</label>
            <textarea
              id="services-field-4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-full">
            <button type="submit" disabled={loading} className="primary-button">
              {loading
                ? "Salvando..."
                : editingId
                  ? " Salvar Alterações"
                  : " Adicionar Serviço"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="secondary-button"
              >
                Cancelar
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
                <th>Nome</th>
                <th>Descrição</th>
                <th>Preço</th>
                <th>Duração</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5">Nenhum serviço cadastrado ainda.</td>
                </tr>
              ) : (
                filtered.map((service) => (
                  <tr key={service.id}>
                    <td>{service.name || "Sem nome"}</td>
                    <td>{service.description || "Não informado"}</td>
                    <td>
                      {typeof service.price === "number"
                        ? service.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "Não informado"}
                    </td>
                    <td>
                      {service.durationInMinutes != null
                        ? `${service.durationInMinutes} min`
                        : "Não informado"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleEditClick(service)}
                        className="secondary-button"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="danger-button"
                      >
                        Excluir
                      </button>
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
