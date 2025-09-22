import DashboardLayout from '@/components/layout/DashboardLayout';
import { withAuth } from '@/components/security/withAuth';

function AppointmentsPage() {
  return <div>Listado de citas</div>;
}

(AppointmentsPage as any).getLayout = (page: any) => <DashboardLayout>{page}</DashboardLayout>;
export default withAuth(AppointmentsPage);