import { Link, useNavigate } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const role = localStorage.getItem('petshop_role');

  const handleLogout = () => {
    localStorage.clear();
    onClose();
    navigate('/');
  };

  const linkStyle = {
    display: 'block',
    padding: '12px 20px',
    color: '#ecf0f1',
    textDecoration: 'none',
    borderBottom: '1px solid #34495e',
    transition: 'background 0.3s'
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div style={{ padding: '20px', backgroundColor: '#1a252f', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>
        🐾 MeuPetShop
        <button type="button" className="sidebar-close" onClick={onClose} aria-label="Fechar menu">×</button>
      </div>

      
      <nav style={{ flex: 1, marginTop: '10px' }}>
        <Link to="/home" onClick={onClose} style={linkStyle}> Home</Link>
        <Link to="/clientes" onClick={onClose} style={linkStyle}> Clientes</Link>
        <Link to="/pets" onClick={onClose} style={linkStyle}> Pets</Link>
        
       
        <Link to="/agendamentos" onClick={onClose} style={linkStyle}> Agenda</Link>
        <Link to="/servicos" onClick={onClose} style={linkStyle}> Serviços</Link>
        <Link to="/produtos" onClick={onClose} style={linkStyle}> Produtos</Link>
        
       
        {(role === 'Admin' || role === 'SuperAdmin') && (
          <Link to="/register" onClick={onClose} style={{ ...linkStyle, backgroundColor: '#27ae60' }}> Registrar Funcionário</Link>
        )}

        
        {role === 'SuperAdmin' && (
          <Link to="/usuarios" onClick={onClose} style={{ ...linkStyle, backgroundColor: '#8e44ad' }}> Gerenciar Equipe</Link>
        )}
      </nav>

      <div style={{ padding: '20px', borderTop: '1px solid #34495e' }}>
        <button onClick={handleLogout} style={{ width: '100%', padding: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}
