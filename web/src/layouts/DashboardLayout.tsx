import React from 'react';
import Sidebar from '../components/ui/Sidebar';
import Header from '../components/ui/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout persistente (Sidebar + Header).
 * NO modifica clases existentes: reutiliza las que ya tengas.
 * Ajusta los className a los que ya usa tu CSS actual.
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-panel">
        <Header />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;