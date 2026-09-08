import { Children } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  X,
  Users,
  PawPrint,
  CalendarDays,
  Scissors,
  Package,
  ShieldCheck,
} from "lucide-react";
const pages = {
  clients: [
    "Gestão de clientes",
    "Acompanhe e gerencie os clientes do seu pet shop.",
    Users,
    "Novo cliente",
  ],
  pets: [
    "Gestão de pets",
    "Todos os pets cadastrados e seus responsáveis.",
    PawPrint,
    "Novo pet",
  ],
  services: [
    "Gestão de serviços",
    "Configure os serviços oferecidos pelo pet shop.",
    Scissors,
    "Novo serviço",
  ],
  products: [
    "Gestão de produtos",
    "Controle o catálogo e o estoque da sua loja.",
    Package,
    "Novo produto",
  ],
  appointments: [
    "Gestão de agendamentos",
    "Organize os próximos atendimentos da sua equipe.",
    CalendarDays,
    "Novo agendamento",
  ],
  users: [
    "Controle de acessos corporativos",
    "Gerencie permissões e membros da equipe.",
    ShieldCheck,
    "Novo colaborador",
  ],
};
export default function ManagementPage({
  kind,
  children,
  formOpen,
  setFormOpen,
  query,
  setQuery,
  count,
}) {
  const [title, description, Icon, action] = pages[kind];
  return (
    <div className={"management-page " + (formOpen ? "form-open" : "")}>
      <div className="page-heading">
        <div>
          <div className="heading-icon">
            <Icon size={21} />
          </div>
          <div>
            <h1>{title}</h1>
            <p className="page-description">{description}</p>
          </div>
        </div>
        {kind === "users" ? (
          <Link className="primary-button" to="/register">
            <Plus size={18} />
            {action}
          </Link>
        ) : (
          <button
            className="primary-button"
            onClick={() => setFormOpen(!formOpen)}
          >
            {formOpen ? <X size={18} /> : <Plus size={18} />}
            {formOpen ? "Fechar formulário" : action}
          </button>
        )}
      </div>
      {Children.toArray(children).map((child, index) =>
        child?.props?.className?.includes("table-panel") ? (
          <section className="panel table-panel" key={index}>
            <div className="table-toolbar">
              <div>
                <h2>
                  {kind === "users"
                    ? "Membros da equipe"
                    : kind === "appointments"
                      ? "Agendamentos"
                      : title.replace("Gestão de ", "") + " cadastrados"}
                </h2>
                <span className="result-count">
                  {count} {count === 1 ? "registro" : "registros"}
                </span>
              </div>
              <div className="table-tools">
                <div className="mini-search">
                  <Search size={16} />
                  <input
                    aria-label="Filtrar resultados"
                    placeholder="Filtrar resultados..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {child.props.children}
          </section>
        ) : (
          child
        ),
      )}
    </div>
  );
}
