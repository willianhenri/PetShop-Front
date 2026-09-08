import { NavLink, useNavigate } from 'react-router-dom';
import { clearSession, getRole } from '../services/session';
import { Button } from './ui';

export default function Sidebar({ isOpen, onClose, sidebarRef }) {
  const navigate = useNavigate();
  const role = getRole();
  const links = [
    ['/home', 'Home'],
    ['/clientes', 'Clientes'],
    ['/pets', 'Pets'],
    ['/agendamentos', 'Agenda'],
    ['/servicos', 'Serviços'],
    ['/produtos', 'Produtos'],
  ];
  if (role === 'Admin' || role === 'SuperAdmin') links.push(['/register', 'Registrar funcionário']);
  if (role === 'SuperAdmin') links.push(['/usuarios', 'Gerenciar equipe']);
  return (
    <aside
      id="navigation"
      ref={sidebarRef}
      className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}
      aria-label="Menu principal"
    >
      <div className="sidebar-brand">
        <span>🐾 MeuPetShop</span>
        <button type="button" className="sidebar-close" onClick={onClose} aria-label="Fechar menu">
          ×
        </button>
      </div>
      <nav aria-label="Navegação principal">
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <Button
          variant="danger"
          onClick={() => {
            clearSession();
            onClose();
            navigate('/login', { replace: true });
          }}
        >
          Sair do sistema
        </Button>
      </div>
    </aside>
  );
}
