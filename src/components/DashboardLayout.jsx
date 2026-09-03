import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  return (
    <div className="dashboard-layout">
      <header className="mobile-header">
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu de navegação"
          aria-expanded={menuOpen}
        >
          ☰
        </button>
        <span>🐾 MeuPetShop</span>
      </header>

      {menuOpen && <button type="button" className="menu-overlay" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />}
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}
