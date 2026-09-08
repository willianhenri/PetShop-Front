import { ShieldCheck } from "lucide-react";
import Brand from "./Brand";
import ThemeToggle from "./ThemeToggle";
export default function AuthLayout({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <main className="auth-page">
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>
      <div className="auth-container">
        <Brand to="/login" />
        <section className="panel auth-card">
          <div className="auth-icon">
            <Icon size={25} />
          </div>
          <h1>{title}</h1>
          <p className="page-description">{description}</p>
          {children}
        </section>
        <p className="auth-footer">
          <ShieldCheck size={14} /> Gestão inteligente para o seu pet shop.
        </p>
      </div>
    </main>
  );
}
