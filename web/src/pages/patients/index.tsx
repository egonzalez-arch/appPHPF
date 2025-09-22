import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { withAuth } from '../../guards/withAuth';

const PatientsPage: React.FC = () => {
  // Mantén aquí la lógica actual de listado; placeholder mínimo
  return (
    <div>
      <h2>Pacientes</h2>
      {/* Lista / tabla existente va aquí */}
    </div>
  );
};

(PatientsPage as any).getLayout = (page: React.ReactNode) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default withAuth(PatientsPage);