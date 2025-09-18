import { DashboardLayout } from '../../layouts/DashboardLayout';
const DashboardPage = () => {
  return <div>Contenido dashboard</div>;
};
DashboardPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default DashboardPage;