import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  // Mantive o seu estilo do Header idêntico aqui
  const headerStyle = {
    backgroundColor: '#1a1a1a',
    color: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  return (
    <BrowserRouter>
      <div>
        {/* O Header fica aqui fixo, aparecendo em todas as páginas */}
        <header style={headerStyle}>
          <h2>Meu PetShop</h2>
          <nav>
            <Link to="/forgot-password" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Esqueci a Senha</Link>
          </nav>
        </header>

        {/* O React Router decide qual componente carregar aqui embaixo baseado na URL */}
        <Routes>
          {/* Quando abrir a URL normal /forgot-password */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Quando o usuário clicar no link do e-mail /reset-password */}
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;