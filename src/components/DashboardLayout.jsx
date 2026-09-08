import { useEffect, useRef, useState } from "react";
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
  const sidebarRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const sidebar = sidebarRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebar.querySelector('button')?.focus();
    const handleKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
      if (event.key !== 'Tab') return;
      const elements = [...sidebar.querySelectorAll('a, button')].filter(
        (element) => element.getClientRects().length,
      );
      const first = elements[0],
        last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const media = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => {
      if (media.matches) setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    media.addEventListener('change', closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      media.removeEventListener('change', closeOnDesktop);
      previousFocus?.focus();
    };
  }, [menuOpen]);
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
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      {menuOpen && (
        <button
          className="menu-overlay"
          aria-label="Fechar menu pelo fundo"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <Sidebar
        sidebarRef={sidebarRef}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        collapsed={collapsed}
        onCollapse={() => setCollapsed(!collapsed)}
      />
      <div className="main-area" inert={menuOpen}>
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
            <label className="sr-only" htmlFor="dashboard-search">Buscar clientes, pets ou serviços</label>
            <input
              id="dashboard-search"
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
        <main id="main-content" tabIndex={-1} className="page-content dashboard-content">{children}</main>
      </div>
    </div>
  );
}
