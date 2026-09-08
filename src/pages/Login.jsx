import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";
import { LogIn, UserRound, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { getApiErrorMessage } from "../services/apiFetch";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Usuário ou senha incorretos."),
        );
      }

      const data = await response.json();

      localStorage.setItem("petshop_token", data.token);
      localStorage.setItem("petshop_role", data.role);
      localStorage.setItem(
        "petshop_name",
        data.fullName || data.user?.fullName || data.username || username,
      );

      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Bem-vindo de volta"
      description="Acesse sua conta para cuidar do seu pet shop."
    >
      {error && (
        <p className="feedback error" role="alert">
          {error}
        </p>
      )}
      <form onSubmit={handleLogin} className="auth-form">
        <div className="auth-field">
          <label htmlFor="username">Nome de usuário</label>
          <div className="input-icon">
            <UserRound size={17} />
            <input
              id="username"
              placeholder="Digite seu usuário"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>
        <PasswordField
          id="password"
          label="Senha"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <Link className="forgot-link" to="/forgot-password">
          Esqueceu a senha?
        </Link>
        <button className="primary-button auth-submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar na minha conta"}
          <ArrowRight size={17} />
        </button>
      </form>
      <p className="auth-note">
        Seu pet shop organizado. Mais tempo para cuidar.
      </p>
    </AuthLayout>
  );
}
