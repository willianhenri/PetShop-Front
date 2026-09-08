import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, Settings, ChevronRight } from "lucide-react";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import { getProfile } from "../services/profile";
export default function DashboardLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const profile = getProfile();
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setProfileOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="menu-overlay"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <Sidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        collapsed={collapsed}
        onCollapse={() => setCollapsed(!collapsed)}
      />
      <div className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label="Abrir menu de navegação"
            aria-expanded={menuOpen}
            aria-controls="navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="search">
            <Search size={18} />
            <input
              aria-label="Buscar clientes, pets ou serviços"
              placeholder="Buscar clientes, pets ou serviços..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query.trim() && (
              <div className="search-results">
                {[
                  ["clientes", "clientes"],
                  ["pets", "pets"],
                  ["serviços", "servicos"],
                ].map(([label, route]) => (
                  <Link
                    key={route}
                    to={"/" + route + "?q=" + encodeURIComponent(query)}
                    onClick={() => setQuery("")}
                  >
                    Buscar “{query}” em {label}
                    <ChevronRight size={15} />
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="top-actions">
            <ThemeToggle />
            <button
              className="icon-button"
              aria-label="Informações da conta"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <Settings size={19} />
            </button>
            <button
              className="profile"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-expanded={profileOpen}
            >
              <span className="avatar">{profile.initials}</span>
              <span className="profile-copy">
                <strong>{profile.name}</strong>
                <span>{profile.role}</span>
              </span>
              <ChevronRight size={16} className="profile-chevron" />
            </button>
            {profileOpen && (
              <div className="profile-popover">
                <strong>{profile.name}</strong>
                <p>{profile.role}</p>
                <Link to="/forgot-password">Redefinir minha senha</Link>
              </div>
            )}
          </div>
        </header>
        <main className="page-content dashboard-content">{children}</main>
      </div>
    </div>
  );
}
