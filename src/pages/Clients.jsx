import ManagementPage from "../components/ManagementPage";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiFetch, getApiErrorMessage } from "../services/apiFetch";
import { IMaskInput } from "react-imask";

export default function Clients() {
  const [searchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(searchParams.get("new") === "1");
  const [localQuery, setLocalQuery] = useState(null);
  const query = localQuery ?? searchParams.get("q") ?? "";
  const [clients, setClients] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setaddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchClients = async () => {
    try {
      const response = await apiFetch("/api/Clients");

      if (response.ok) {
        const data = await response.json();

        setClients(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("A API retornou um erro:", response.status);
        setClients([]);
      }
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      setClients([]);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchClients);
  }, []);

  const handleDeleteClient = async (id) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir este cliente? Essa ação não pode ser desfeita.",
    );
    if (!confirmDelete) return;

    try {
      const response = await apiFetch(`/api/Clients/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Erro ao excluir o cliente."),
        );
      }

      setSuccess("Cliente excluído com sucesso!");
      setError("");
      fetchClients();
    } catch (err) {
      setError(err.message);
      setSuccess("");
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("O nome do cliente não pode estar vazio.");
      return;
    }
    const normalizedAddress = address.trim() || "Não informado";
    const normalizedEmail = email.trim().toLowerCase();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await apiFetch("/api/Clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          name: trimmedName,
          phone,
          email: normalizedEmail,
          address: normalizedAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Erro ao cadastrar cliente."),
        );
      }

      setSuccess("Cliente cadastrado com sucesso!");

      setName("");
      setPhone("");
      setEmail("");
      setaddress("");

      fetchClients();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = clients.filter((item) =>
    JSON.stringify(item)
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );

  return (
    <ManagementPage
      kind="clients"
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
        <h3>Novo Cliente</h3>

        <form onSubmit={handleCreateClient} className="form-grid">
          <div>
            <label htmlFor="clients-field-1">Nome Completo:</label>
            <input
              id="clients-field-1"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="clients-field-2">Telefone:</label>
            <IMaskInput
              id="clients-field-2"
              mask="(00) 00000-0000"
              value={phone}
              unmask={false}
              onAccept={(value) => setPhone(value)}
              placeholder="(00) 00000-0000"
              type="tel"
              inputMode="numeric"
              required
            />
          </div>
          <div>
            <label htmlFor="clients-field-3">E-mail:</label>
            <input
              id="clients-field-3"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@exemplo.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="clients-field-4">Endereço:</label>
            <input
              id="clients-field-4"
              type="text"
              value={address}
              onChange={(e) => setaddress(e.target.value)}
              required
            />
          </div>

          <div className="form-full">
            <button type="submit" disabled={loading} className="primary-button">
              {loading ? "Salvando..." : " Adicionar Cliente"}
            </button>
          </div>
        </form>
      </div>

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Endereço</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5">Nenhum cliente cadastrado ainda.</td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr key={client.id}>
                    <td>{client.name || "Sem nome"}</td>
                    <td>{client.phone || "Sem telefone"}</td>
                    <td>{client.email || "Sem e-mail"}</td>
                    <td>{client.address || "Não informado"}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
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
