import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import Clients from './pages/Clients';
import Pets from './pages/Pets';
import Users from './pages/Users'; 
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DashboardLayout from './components/DashboardLayout';


function ProtectedRoute({ children }) {
  const token = localStorage.getItem('petshop_token');
  if (!token) return <Navigate to="/" replace />;
  return children;
}


function AdminRoute({ children }) {
  const token = localStorage.getItem('petshop_token');
  const role = localStorage.getItem('petshop_role');
  if (!token || (role !== 'Admin' && role !== 'SuperAdmin')) {
    return <Navigate to="/home" replace />;
  }
  return children;
}


function SuperAdminRoute({ children }) {
  const token = localStorage.getItem('petshop_token');
  const role = localStorage.getItem('petshop_role');
  if (!token || role !== 'SuperAdmin') {
    return <Navigate to="/home" replace />; 
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

        <Route path="/register" element={
          <AdminRoute>
            <DashboardLayout>
              <Register />
            </DashboardLayout>
          </AdminRoute>
        } />

        
        <Route path="/usuarios" element={
          <SuperAdminRoute>
            <DashboardLayout>
              <Users />
            </DashboardLayout>
          </SuperAdminRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;