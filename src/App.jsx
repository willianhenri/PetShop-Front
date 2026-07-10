import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DashboardLayout from './components/DashboardLayout';
import Clients from './pages/Clients';
import Pets from './pages/Pets.jsx';

// Bloqueio 1: Precisa estar logado
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('petshop_token');
  if (!token) return <Navigate to="/" replace />;
  return children;
}

// Bloqueio 2: Precisa estar logado E ser Admin
function AdminRoute({ children }) {
  const token = localStorage.getItem('petshop_token');
  const role = localStorage.getItem('petshop_role');
  
  if (!token || role !== 'Admin') {
    return <Navigate to="/home" replace />; // Expulsa de volta pra Home
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Login />} />
        
        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
       
       <Route path="/home" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Home />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        
        <Route path="/register" element={
          <AdminRoute>
            <DashboardLayout>
              <Register />
            </DashboardLayout>
          </AdminRoute>
        } />

        <Route path="/clientes" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Clients />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/pets" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Pets />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;