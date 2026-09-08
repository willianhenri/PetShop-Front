import ManagementPage from "../components/ManagementPage";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiFetch, getApiErrorMessage } from "../services/apiFetch";

export default function Pets() {
  const [searchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(searchParams.get("new") === "1");
  const [localQuery, setLocalQuery] = useState(null);
  const query = localQuery ?? searchParams.get("q") ?? "";
  const [pets, setPets] = useState([]);
  const [clients, setClients] = useState([]);

  // Campos do Formulário
  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [specie, setSpecie] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPets = async () => {
    try {
      const response = await apiFetch("/api/Pets");
      if (response.ok) {
        const responseData = await response.json();

        setPets(Array.isArray(responseData.data) ? responseData.data : []);
      }
    } catch (err) {
      console.error("Erro ao buscar pets:", err);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await apiFetch("/api/Clients");
      if (response.ok) {
        const responseData = await response.json();
        setClients(Array.isArray(responseData.data) ? responseData.data : []);
      }
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => {
      fetchPets();
      fetchClients();
    });
  }, []);

  const handleCreatePet = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!clientId) {
      setError("Por favor, selecione um dono para o pet.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch(`/api/clients/${clientId}/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, breed, specie }),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Erro ao cadastrar pet."),
        );
      }

      setSuccess("Pet cadastrado com sucesso!");

      setName("");
      setBreed("");
      setSpecie("");
      setClientId("");

      fetchPets();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async (id) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este pet?",
    );
    if (!confirmDelete) return;

    try {
      const response = await apiFetch(`/api/Pets/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Erro ao excluir o pet."),
        );
      }

      setSuccess("Pet excluído com sucesso!");
      fetchPets();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = pets.filter((item) =>
    JSON.stringify(item)
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );

  return (
    <ManagementPage
      kind="pets"
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
        <h3>Novo Pet</h3>

        <form onSubmit={handleCreatePet} className="form-grid">
          <div>
            <label htmlFor="pets-field-1">Dono do Pet:</label>
            <select
              id="pets-field-1"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              <option value="">-- Selecione o Cliente --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pets-field-2">Nome do Pet:</label>
            <input
              id="pets-field-2"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="pets-field-3">Espécie (Ex: Cão, Gato):</label>
            <input
              id="pets-field-3"
              type="text"
              value={specie}
              onChange={(e) => setSpecie(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="pets-field-4">Raça:</label>
            <input
              id="pets-field-4"
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              required
            />
          </div>

          <div className="form-full">
            <button type="submit" disabled={loading} className="primary-button">
              {loading ? "Salvando..." : " Adicionar Pet"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Pets */}
      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nome do Pet</th>
                <th>Espécie</th>
                <th>Raça</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4">Nenhum pet cadastrado ainda.</td>
                </tr>
              ) : (
                filtered.map((pet) => (
                  <tr key={pet.id}>
                    <td>{pet.name || "Sem nome"}</td>
                    <td>{pet.specie || "Não informada"}</td>
                    <td>{pet.breed || "Não informada"}</td>
                    <td>
                      <button
                        onClick={() => handleDeletePet(pet.id)}
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
