import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

type Props = {
  children: React.ReactNode;
};

export const DashboardLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="dashboard-grid">
      <Sidebar className="sidebar" />
      <main className="content">
        <Header className="header" title="Panel" />
        <div className="page">{children}</div>
      </main>
    </div>
  );
};