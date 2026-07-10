import React from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      
      <Sidebar />

      
      <div style={{ marginLeft: '250px', padding: '30px', flex: 1, width: '100%' }}>
        {children}
      </div>
    </div>
  );
}