'use client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchDoctors, createDoctor, updateDoctor, deleteDoctor, Doctor } from '@/lib/api/api'; // Usa API central
import DoctorForm from '@/components/forms/DoctorForm';

export default function DoctorsPage() {
  const { data: doctors, refetch } = useQuery<Doctor[]>({ queryKey: ['doctors'], queryFn: fetchDoctors });

  // Tipado explícito para la mutación de crear doctor
  const createMutation = useMutation<Doctor, Error, Omit<Doctor, "id">>({
    mutationFn: createDoctor,
    onSuccess: () => refetch()
  });

  // Tipado explícito para la mutación de editar doctor
  const updateMutation = useMutation<Doctor, Error, { id: string; data: Partial<Doctor> }>({
    mutationFn: ({ id, data }) => updateDoctor(id, data),
    onSuccess: () => refetch()
  });

  // Tipado explícito para la mutación de eliminar doctor
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteDoctor,
    onSuccess: () => refetch()
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Doctores</h1>
      <DoctorForm onSubmit={(data: Omit<Doctor, "id">) => createMutation.mutate(data)} />
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
            {doctors?.map((d: Doctor) => (
              <tr key={d.id}>
                <td>{d.specialty}</td>
                <td>{d.license}</td>
                <td>{d.bio}</td>
                <td>
                  <button
                    onClick={() => updateMutation.mutate({ id: d.id, data: d })}
                    className="mr-2 px-2 py-1 bg-blue-500 text-white rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(d.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}