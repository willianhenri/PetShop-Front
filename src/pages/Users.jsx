import ManagementPage from "../components/ManagementPage";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiFetch, getApiErrorMessage } from "../services/apiFetch";

export default function Users() {
  const [searchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(searchParams.get("new") === "1");
  const [localQuery, setLocalQuery] = useState(null);
  const query = localQuery ?? searchParams.get("q") ?? "";
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await apiFetch("/api/Auth");

      if (response.ok) {
        const responseData = await response.json();

        const lista = responseData.data ? responseData.data : responseData;
        setUsers(Array.isArray(lista) ? lista : []);
      } else {
        setError("Erro ao carregar a lista de equipe.");
      }
    } catch {
      setError("Falha na conexão com o servidor.");
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchUsers);
  }, []);

  const handleDeleteUser = async (id, name) => {
    const confirmDelete = window.confirm(
      `PERIGO: Tem certeza que deseja remover permanentemente o acesso de ${name}?`,
    );
    if (!confirmDelete) return;

    try {
      setError("");
      setSuccess("");
      const response = await apiFetch(`/api/Auth/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Erro ao remover usuário."),
        );
      }

      setSuccess("Colaborador removido com sucesso!");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = users.filter((item) =>
    JSON.stringify(item)
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );

  return (
    <ManagementPage
      kind="users"
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

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nome Completo</th>
                <th>Usuário (Username)</th>
                <th>E-mail</th>
                <th>Cargo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5">Nenhum usuário listado.</td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id}>
                    <td>{user.fullName}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "white",
                          backgroundColor:
                            user.role === "SuperAdmin"
                              ? "#d35400"
                              : user.role === "Admin"
                                ? "#f1c40f"
                                : "#3498db",
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.fullName)}
                        className="danger-button"
                      >
                        Deletar Conta
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
