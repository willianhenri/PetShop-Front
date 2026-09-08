import { UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, getApiErrorMessage } from "../services/apiFetch";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("Funcionario");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await apiFetch("/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ username, email, password, fullName, role }),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Erro ao registrar usuário."),
        );
      }

      setSuccess("Novo usuário cadastrado com sucesso!");

      setFullName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("Funcionario");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="page-heading">
        <div>
          <div className="heading-icon">
            <UserRound size={21} />
          </div>
          <div>
            <h1>Cadastrar novo colaborador</h1>
            <p className="page-description">
              Adicione um novo membro à sua equipe.
            </p>
          </div>
        </div>
      </div>
      <div className="panel form-panel register-card">
        <div className="panel-heading">
          <div>
            <h2>Informações do colaborador</h2>
            <p>Preencha os dados para criar o acesso.</p>
          </div>
        </div>
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

        <form className="form-grid" onSubmit={handleRegister}>
          <div>
            <label htmlFor="register-field-1">Nome Completo:</label>
            <input
              id="register-field-1"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="register-field-2">Nome de Usuário:</label>
            <input
              id="register-field-2"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="register-field-3">E-mail corporativo:</label>
            <input
              id="register-field-3"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="register-field-4">Senha Provisória:</label>
            <input
              id="register-field-4"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="register-field-5">Nível de Acesso (Perfil):</label>
            <select
              id="register-field-5"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="Funcionario">Funcionário Comum</option>
              <option value="Admin">Administrador (Total)</option>
            </select>
          </div>

          <div className="form-footer form-full">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/home")}
            >
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="primary-button">
              {loading ? "Salvando..." : "Confirmar Cadastro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
