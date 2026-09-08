import { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
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
  return (
    <div className="dashboard-layout">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <header className="mobile-header">
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu de navegação"
          aria-expanded={menuOpen}
          aria-controls="navigation"
        >
          ☰
        </button>
        <span>🐾 MeuPetShop</span>
      </header>
      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}
      <Sidebar sidebarRef={sidebarRef} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main id="main-content" tabIndex={-1} className="dashboard-content" inert={menuOpen}>
        {children}
      </main>
    </div>
  );
}
