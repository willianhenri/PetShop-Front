import { clearSession, getRole } from "../services/session";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays,
  Scissors,
  Package,
  UserRound,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Brand from "./Brand";
const links = [
  ["/home", "Visão geral", LayoutDashboard],
  ["/clientes", "Clientes", Users],
  ["/pets", "Pets", PawPrint],
  ["/agendamentos", "Agenda", CalendarDays],
  ["/servicos", "Serviços", Scissors],
  ["/produtos", "Produtos", Package],
];
export default function Sidebar({ isOpen, onClose, collapsed, onCollapse, sidebarRef }) {
  const navigate = useNavigate();
  const role = getRole();
  const logout = () => {
    clearSession();
    onClose();
    navigate("/login");
  };
  const item = ([path, label, Icon]) => (
    <NavLink
      key={path}
      to={path}
      onClick={onClose}
      title={collapsed ? label : undefined}
      className={({ isActive }) => "nav-item " + (isActive ? "active" : "")}
    >
      <Icon size={19} />
      <span>{label}</span>
    </NavLink>
  );
  return (
    <aside
      id="navigation"
      ref={sidebarRef}
      aria-label="Menu principal"
      className={
        "sidebar " +
        (collapsed ? "collapsed " : "") +
        (isOpen ? "sidebar--open" : "")
      }
    >
      <button
        className="sidebar-close icon-button"
        aria-label="Fechar menu"
        onClick={onClose}
      >
        <X size={20} />
      </button>
      <Brand collapsed={collapsed} />
      <nav className="nav-list" aria-label="Navega??o principal">
        <p className="nav-label">MENU PRINCIPAL</p>
        {links.map(item)}
        {(role === "Admin" || role === "SuperAdmin") && (
          <>
            <p className="nav-label management-label">GESTÃO</p>
            {item(["/register", "Registrar funcionário", UserRound])}
          </>
        )}
        {role === "SuperAdmin" &&
          item(["/usuarios", "Gerenciar equipe", ShieldCheck])}
      </nav>
      <div className="sidebar-bottom">
        <button
          className="nav-item logout"
          onClick={logout}
          title="Sair do sistema"
        >
          <LogOut size={19} />
          <span>Sair do sistema</span>
        </button>
        <button
          className="collapse-btn"
          onClick={onCollapse}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span>Recolher menu</span>
        </button>
      </div>
    </aside>
  );
}
