import React from 'react';
import Sidebar from '../components/ui/Sidebar';
import Header from '../components/ui/Header';

interface Props { children: React.ReactNode }

export const DashboardLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-panel">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
};