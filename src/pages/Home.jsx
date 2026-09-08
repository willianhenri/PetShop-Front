import { Link } from 'react-router-dom';
import { useCollection } from '../hooks/useCollection';
import { PageCard, CollectionStatus } from '../components/ui';
import { getRole } from '../services/session';

export default function Home() {
  const clients = useCollection('/api/Clients');
  const products = useCollection('/api/Products');
  const appointments = useCollection('/api/appointments');
  const now = new Date();
  const upcoming = appointments.data
    .filter((item) => Number(item.status) === 0 && new Date(item.appointmentDateTime) >= now)
    .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime));
  const today = appointments.data.filter(
    (item) =>
      Number(item.status) !== 2 &&
      new Date(item.appointmentDateTime).toDateString() === now.toDateString(),
  );
  const lowStock = products.data.filter(
    (item) => typeof item.stockQuantity === 'number' && item.stockQuantity <= 5,
  );
  const roles = {
    Admin: 'Administrador',
    Funcionario: 'Funcionário',
    SuperAdmin: 'Super administrador',
  };
  return (
    <div>
      <h1 className="page-title">Painel de controle</h1>
      <p>
        Bem-vindo ao MeuPetShop. Seu perfil: <strong>{roles[getRole()] ?? 'Não informado'}</strong>.
      </p>
      <nav className="quick-actions" aria-label="Ações rápidas">
        <Link className="button button--primary" to="/agendamentos">
          Novo agendamento
        </Link>
        <Link className="button button--secondary" to="/clientes">
          Cadastrar cliente
        </Link>
        <Link className="button button--secondary" to="/pets">
          Cadastrar pet
        </Link>
      </nav>
      <div className="dashboard-grid">
        <PageCard>
          <h2>Total de clientes</h2>
          <CollectionStatus {...clients} />
          {!clients.loading && !clients.error && <p className="metric">{clients.data.length}</p>}
        </PageCard>
        <PageCard>
          <h2>Agendamentos hoje</h2>
          <CollectionStatus {...appointments} />
          {!appointments.loading && !appointments.error && <p className="metric">{today.length}</p>}
        </PageCard>
        <PageCard>
          <h2>Estoque baixo</h2>
          <p>Produtos com até 5 unidades</p>
          <CollectionStatus {...products} />
          {!products.loading && !products.error && <p className="metric">{lowStock.length}</p>}
        </PageCard>
      </div>
      <PageCard>
        <h2>Próximos agendamentos</h2>
        <CollectionStatus {...appointments} />
        {!appointments.loading &&
          !appointments.error &&
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
        <CollectionStatus {...products} />
        {!products.loading &&
          !products.error &&
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
