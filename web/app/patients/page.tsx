'use client';
import { useQuery, useMutation, QueryClientProvider } from '@tanstack/react-query';
import { client } from '@/lib/api';
import PatientForm from '@/components/forms/PatientForm';

function fetchPatients() {
  return fetch('/api/patients', { credentials: 'include' }).then(res => res.json());
}

function createPatient(data: any) {
  return fetch('/api/patients', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

function updatePatient(id: string, data: any) {
  return fetch(`/api/patients/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

function deletePatient(id: string) {
  return fetch(`/api/patients/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  }).then(res => res.json());
}

export default function PatientsPage() {
  const { data: patients, refetch } = useQuery({ queryKey: ['patients'], queryFn: fetchPatients });

  const createMutation = useMutation({ mutationFn: createPatient, onSuccess: refetch });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => updatePatient(id, data), onSuccess: refetch });
  const deleteMutation = useMutation({ mutationFn: deletePatient, onSuccess: refetch });

  return (
    <QueryClientProvider client={client}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Pacientes</h1>
        <PatientForm onSubmit={data => createMutation.mutate(data)} />
        <div className="mt-8">
          <table className="w-full border">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha Nac.</th>
                <th>Sexo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {patients?.map(p => (
                <tr key={p.id}>
                  <td>{p.firstName} {p.lastName}</td>
                  <td>{p.birthDate}</td>
                  <td>{p.sex}</td>
                  <td>
                    <button onClick={() => updateMutation.mutate({ id: p.id, data: p })}>Editar</button>
                    <button onClick={() => deleteMutation.mutate(p.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </QueryClientProvider>
  );
}