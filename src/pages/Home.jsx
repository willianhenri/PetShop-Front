import { Link } from "react-router-dom";
import {
  CalendarDays,
  Users,
  PawPrint,
  CircleDollarSign,
  ArrowUpRight,
  Plus,
  Activity,
  Dog,
  Scissors,
  ChevronRight,
} from "lucide-react";
import { useCollection } from "../hooks/useCollection";
import { CollectionStatus, PageCard } from "../components/ui";
import { getProfile } from "../services/profile";
export default function Home() {
  const profile = getProfile();
  const clientsState = useCollection('/api/Clients');
  const petsState = useCollection('/api/Pets');
  const appointmentsState = useCollection('/api/appointments');
  const productsState = useCollection('/api/Products');
  const data = {
    clients: clientsState.loading || clientsState.error ? null : clientsState.data,
    pets: petsState.loading || petsState.error ? null : petsState.data,
    appointments: appointmentsState.loading || appointmentsState.error ? null : appointmentsState.data,
  };
  const count = (value) => value ? value.length : '—';
  const appointments = appointmentsState.data;
  const lowStock = productsState.data.filter(item => typeof item.stockQuantity === 'number' && item.stockQuantity <= 5);
  const now = new Date();
  const today = appointments.filter(
    (item) =>
      new Date(item.appointmentDateTime).toDateString() ===
        now.toDateString() && Number(item.status) !== 2,
  );
  const upcoming = appointments.filter(item => Number(item.status) === 0 && new Date(item.appointmentDateTime) >= now)
    .sort((a,b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime));
  const stats = [
    [
      CalendarDays,
      "teal",
      "Consultas hoje",
      data.appointments ? today.length : "—",
      today.length
          ? "Atendimentos agendados"
          : "Nenhum atendimento agendado",
      "/agendamentos",
    ],
    [
      Users,
      "blue",
      "Total de clientes",
      count(data.clients),
      "Clientes cadastrados",
      "/clientes",
    ],
    [
      PawPrint,
      "orange",
      "Pets cadastrados",
      count(data.pets),
      "Base ativa",
      "/pets",
    ],
    [
      CircleDollarSign,
      "purple",
      "Estoque baixo",
      productsState.loading || productsState.error ? '—' : lowStock.length,
      "Produtos com até 5 unidades",
      "/produtos",
    ],
  ];
  return (
    <div>
      <div className="welcome-row">
        <div>
          <p className="eyebrow">
            {now
              .toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
              .toUpperCase()}
          </p>
          <h1>Painel de controle</h1>
          <p className="page-description">
            Bem-vindo de volta
            {profile.name !== "Minha conta"
              ? ", " + profile.name.split(" ")[0]
              : ""}
            . Seu nível de acesso atual é <strong>{profile.role}</strong>.
          </p>
        </div>
        <Link className="primary-button" to="/agendamentos?new=1">
          <Plus size={18} /> Novo agendamento
        </Link>
      </div>
      <CollectionStatus {...clientsState} />
      <CollectionStatus {...petsState} />
      <CollectionStatus {...appointmentsState} />
      <CollectionStatus {...productsState} />
      <div className="stats-grid">
        {stats.map(([Icon, color, label, value, detail, to]) => (
          <div className="stat-card" key={label}>
            <div className={"stat-icon " + color}>
              <Icon size={21} />
            </div>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{detail}</small>
            </div>
            {to && (
              <Link
                to={to}
                className="stat-arrow"
                aria-label={"Ver " + label.toLowerCase()}
              >
                <ArrowUpRight size={18} />
              </Link>
            )}
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Atividade recente</h2>
              <p>Acompanhe as últimas movimentações.</p>
            </div>
            <Link className="ghost-button" to="/agendamentos">
              Ver tudo <ArrowUpRight size={15} />
            </Link>
          </div>
          {appointments.length ? (
            <div className="activity-list">
              {[...appointments]
                .sort(
                  (a, b) =>
                    new Date(b.appointmentDateTime) -
                    new Date(a.appointmentDateTime),
                )
                .slice(0, 3)
                .map((item) => (
                  <Link
                    className="quick-action"
                    to="/agendamentos"
                    key={item.id}
                  >
                    <div className="quick-icon">
                      <CalendarDays size={18} />
                    </div>
                    <div>
                      <strong>
                        {item.pet?.name || "Atendimento"} ·{" "}
                        {item.service?.name || "Serviço agendado"}
                      </strong>
                      <span>
                        {new Date(item.appointmentDateTime).toLocaleString(
                          "pt-BR",
                        )}
                      </span>
                    </div>
                    <ChevronRight size={17} />
                  </Link>
                ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Activity size={23} />
              </div>
              <strong>
                {data.appointments
                  ? "Nenhuma atividade recente"
                  : "Atividades indisponíveis"}
              </strong>
              <span>As movimentações do seu pet shop aparecerão aqui.</span>
            </div>
          )}
        </section>
        <section className="panel quick-panel">
          <div className="panel-heading">
            <div>
              <h2>Acesso rápido</h2>
              <p>Atalhos para as tarefas mais comuns.</p>
            </div>
          </div>
          {[
            [
              Users,
              "Adicionar cliente",
              "Cadastre um novo responsável",
              "/clientes",
            ],
            [Dog, "Cadastrar pet", "Adicione um novo companheiro", "/pets"],
            [Scissors, "Novo serviço", "Configure seu catálogo", "/servicos"],
          ].map(([Icon, title, description, route]) => (
            <Link className="quick-action" to={route + "?new=1"} key={route}>
              <div className="quick-icon">
                <Icon size={18} />
              </div>
              <div>
                <strong>{title}</strong>
                <span>{description}</span>
              </div>
              <ChevronRight size={17} />
            </Link>
          ))}
        </section>
      </div>
      <PageCard>
        <h2>Próximos agendamentos</h2>
        <CollectionStatus {...appointmentsState} />
        {!appointmentsState.loading &&
          !appointmentsState.error &&
          (upcoming.length ? (
            <ul className="summary-list">
              {upcoming.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <strong>{new Date(item.appointmentDateTime).toLocaleString('pt-BR')}</strong> ·{' '}
                  {item.pet?.name ?? 'Pet'} · {item.service?.name ?? 'Serviço'} ·{' '}
                  {item.client?.name ?? 'Cliente'}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum agendamento futuro.</p>
          ))}
        <Link to="/agendamentos">Ver agenda completa</Link>
      </PageCard>
      <PageCard>
        <h2>Reposição de produtos</h2>
        <CollectionStatus {...productsState} />
        {!productsState.loading &&
          !productsState.error &&
          (lowStock.length ? (
            <ul className="summary-list">
              {lowStock.map((item) => (
                <li key={item.id}>
                  {item.name}: <strong>{item.stockQuantity} unidades</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum produto com estoque baixo.</p>
          ))}
        <Link to="/produtos">Gerenciar produtos</Link>
      </PageCard>
    </div>
  );
}
