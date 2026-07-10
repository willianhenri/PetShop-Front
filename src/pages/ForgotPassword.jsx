import React, { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      
      const response = await fetch('https://manager-petshop.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({ email: email }),
      });

      if (response.ok) {
        alert('Se o e-mail existir na nossa base, um link de recuperação será enviado!');
        setEmail(''); 
      } else {
        alert('Ocorreu um erro ao tentar enviar o e-mail. Tente novamente mais tarde.');
      }

    } catch (error) {
      alert('Erro de conexão com o servidor.');
    }
  };

  const mainStyle = {
    padding: '2rem',
    fontFamily: 'sans-serif',
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '50px'
  };

  return (
    <main style={mainStyle}>
      <h2>Esqueci minha senha</h2>
      <p>Digite seu e-mail cadastrado para solicitar a redefinição de senha.</p>

      <form onSubmit={handleSubmit} style={{ textAlign: 'center', marginTop: '20px' }}>
        <input
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
  );
}