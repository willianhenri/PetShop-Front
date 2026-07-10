import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {

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
       
        <header style={headerStyle}>
          <h2>Meu PetShop</h2>
          <nav>
            <Link to="/forgot-password" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Esqueci a Senha</Link>
          </nav>
        </header>

       
        <Routes>
         
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;