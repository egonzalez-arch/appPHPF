'use client';
import { useQuery, useMutation, QueryClientProvider } from '@tanstack/react-query';
import { client } from '@/lib/api';
import DoctorForm from '@/components/forms/DoctorForm';

function fetchDoctors() {
  return fetch('/api/doctors', { credentials: 'include' }).then(res => res.json());
}

function createDoctor(data: any) {
  return fetch('/api/doctors', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

function updateDoctor(id: string, data: any) {
  return fetch(`/api/doctors/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

function deleteDoctor(id: string) {
  return fetch(`/api/doctors/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  }).then(res => res.json());
}

export default function DoctorsPage() {
  const { data: doctors, refetch } = useQuery({ queryKey: ['doctors'], queryFn: fetchDoctors });

  const createMutation = useMutation({ mutationFn: createDoctor, onSuccess: refetch });
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => updateDoctor(id, data), onSuccess: refetch });
  const deleteMutation = useMutation({ mutationFn: deleteDoctor, onSuccess: refetch });

  return (
    <QueryClientProvider client={client}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Doctores</h1>
        <DoctorForm onSubmit={data => createMutation.mutate(data)} />
        <div className="mt-8">
          <table className="w-full border">
            <thead>
              <tr>
                <th>Especialidad</th>
                <th>Licencia</th>
                <th>Bio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {doctors?.map(d => (
                <tr key={d.id}>
                  <td>{d.specialty}</td>
                  <td>{d.license}</td>
                  <td>{d.bio}</td>
                  <td>
                    <button onClick={() => updateMutation.mutate({ id: d.id, data: d })}>Editar</button>
                    <button onClick={() => deleteMutation.mutate(d.id)}>Eliminar</button>
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