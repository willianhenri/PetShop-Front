import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail, ArrowLeft, ArrowRight } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { API_BASE_URL } from "../config/api";
import { getApiErrorMessage } from "../services/apiFetch";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_BASE_URL + "/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok)
        throw new Error(
          await getApiErrorMessage(
            response,
            "Não foi possível enviar o e-mail. Tente novamente.",
          ),
        );
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout
      icon={sent ? Mail : KeyRound}
      title={sent ? "Confira seu e-mail" : "Esqueceu sua senha?"}
      description={
        sent
          ? "Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha."
          : "Sem problemas. Informe seu e-mail cadastrado e enviaremos um link de recuperação."
      }
    >
      {error && (
        <p className="feedback error" role="alert">
          {error}
        </p>
      )}
      {sent ? (
        <div className="auth-success" role="status">
          <p>Verifique também sua caixa de spam.</p>
          <button className="secondary-button" onClick={() => setSent(false)}>
            Tentar outro e-mail
          </button>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">E-mail cadastrado</label>
            <div className="input-icon">
              <Mail size={17} />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <button className="primary-button auth-submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link de recuperação"}
            <ArrowRight size={17} />
          </button>
        </form>
      )}
      <Link className="auth-back" to="/login">
        <ArrowLeft size={15} /> Voltar para o login
      </Link>
    </AuthLayout>
  );
}
