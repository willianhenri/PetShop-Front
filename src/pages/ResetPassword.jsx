import AuthLayout from "../components/AuthLayout";
import PasswordField from "../components/PasswordField";
import { LockKeyhole, ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { getApiErrorMessage } from "../services/apiFetch";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();

  const tokenBody = searchParams.get("token");
  const token = tokenBody ? tokenBody.replace(/ /g, "+") : null;

  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const invalidResetLink = !token || !email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (invalidResetLink || loading || message) return;
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          token: token,
          newPassword: password,
        }),
      });
      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Erro ao redefinir a senha."),
        );
      }

      setMessage(
        "Senha redefinida com sucesso! Você já pode acessar sua conta.",
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={message ? Check : LockKeyhole}
      title={message ? "Tudo pronto!" : "Crie uma nova senha"}
      description="Defina sua nova senha para acessar o MeuPetShop."
    >
      {(error || invalidResetLink) && (
        <p className="feedback error" role="alert">
          {error ||
            "Link de recuperação inválido. Solicite um novo link para continuar."}
        </p>
      )}
      {message ? (
        <>
          <p className="feedback success" role="status">
            {message}
          </p>
          <Link className="primary-button auth-submit" to="/login">
            Ir para o login
          </Link>
        </>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <PasswordField
            id="new-password"
            label="Nova senha"
            placeholder="Pelo menos 6 caracteres"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || invalidResetLink}
          />
          <PasswordField
            id="confirm-password"
            label="Confirmar nova senha"
            placeholder="Digite a senha novamente"
            autoComplete="new-password"
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading || invalidResetLink}
          />
          <button
            className="primary-button auth-submit"
            disabled={loading || invalidResetLink}
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
            <Check size={17} />
          </button>
        </form>
      )}
      {invalidResetLink && (
        <Link className="auth-back" to="/forgot-password">
          Solicitar novo link
        </Link>
      )}
      <Link className="auth-back" to="/login">
        <ArrowLeft size={15} /> Voltar para o login
      </Link>
    </AuthLayout>
  );
}
