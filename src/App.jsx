import React, { useState } from 'react';

function App() {
  // Isso é um "Estado" no React. Ele guarda o e-mail que o usuário vai digitar.
  const [email, setEmail] = useState('');

  // Essa função roda quando o usuário clica no botão de enviar
  const handleSubmit = (e) => {
    e.preventDefault(); // Impede que a página dê "refresh" (comportamento padrão do HTML)
    
    // Por enquanto, vamos apenas mostrar um alerta na tela para testar!
    alert(`O e-mail digitado foi: ${email}\n\nEm breve vamos enviar isso para a API no C#!`);
  };

  // Estilos em linha
  const headerStyle = {
    backgroundColor: '#1a1a1a',
    color: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const mainStyle = {
    padding: '2rem',
    fontFamily: 'sans-serif',
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Centraliza o conteúdo
    marginTop: '50px'
  };

  return (
    <div>
      <header style={headerStyle}>
        <h2>Meu PetShop</h2>
        <nav>
          <a href="#" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Home</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Login</a>
        </nav>
      </header>

      <main style={mainStyle}>
        <h2>Esqueci minha senha</h2>
        <p>Digite seu e-mail cadastrado para solicitar a redefinição de senha.</p>

        {/* Formulário que chama a nossa função handleSubmit */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'center', marginTop: '20px' }}>
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Atualiza o estado a cada letra digitada
            required
            style={{ padding: '10px', width: '300px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <br />
          <button 
            type="submit" 
            style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
          >
            Enviar Solicitação
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;