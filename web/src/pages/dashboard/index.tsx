import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { withAuth } from '../../guards/withAuth';

const DashboardPage: React.FC = () => {
  return (
    <div>
      {/* Coloca aquí el contenido existente del dashboard */}
      <h1>Dashboard</h1>
    </div>
  );
};

(DashboardPage as any).getLayout = (page: React.ReactNode) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default withAuth(DashboardPage);