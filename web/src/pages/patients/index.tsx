import dynamic from 'next/dynamic';
const PatientsTable = dynamic(() => import('../../components/PatientsTable'), { ssr: false, loading: () => <p>Cargando...</p> });

export default function PatientsPage() {
  return <PatientsTable />;
}