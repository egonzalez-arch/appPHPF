'use client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchPatients, createPatient, updatePatient, deletePatient, Patient } from '@/lib/api/api';
import PatientForm from '@/components/forms/PatientForm';
import { useState } from 'react';
//import Sidebar from '@/components/Sidebar';

export default function PatientsPageContent() {
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: patients, refetch, isLoading, isError, error } = useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
  });

  const createMutation = useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      refetch();
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) => updatePatient(id, data),
    onSuccess: () => {
      refetch();
      setEditPatient(null);
      setShowForm(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => refetch()
  });

  function handleEdit(patient: Patient) {
    setEditPatient(patient);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (window.confirm('¿Seguro que deseas eliminar este paciente?')) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <button
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 shadow"
            onClick={() => { setEditPatient(null); setShowForm(true); }}
            aria-label="Crear nuevo paciente"
          >
            ➕ Nuevo Paciente
          </button>
        </div>

        {isLoading && <div className="py-8 text-center text-gray-500">Cargando pacientes...</div>}
        {isError && <div className="py-8 text-center text-red-600">Error: {String(error)}</div>}
        {deleteMutation.isError && <div className="text-red-600 mb-2">Error al eliminar paciente</div>}
        {createMutation.isError && <div className="text-red-600 mb-2">Error al crear paciente</div>}
        {updateMutation.isError && <div className="text-red-600 mb-2">Error al editar paciente</div>}
        {deleteMutation.isSuccess && <div className="text-green-600 mb-2">Paciente eliminado correctamente</div>}
        {createMutation.isSuccess && <div className="text-green-600 mb-2">Paciente creado correctamente</div>}
        {updateMutation.isSuccess && <div className="text-green-600 mb-2">Paciente actualizado correctamente</div>}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
              <PatientForm
                initialValues={editPatient || undefined}
                onSubmit={data => {
                  if (editPatient) {
                    updateMutation.mutate({ id: editPatient.id, data });
                  } else {
                    createMutation.mutate(data);
                  }
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditPatient(null);
                }}
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded shadow border overflow-x-auto mt-2">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-teal-100">
                <th className="px-4 py-2 border-b">Nombre</th>
                <th className="px-4 py-2 border-b">Apellido</th>
                <th className="px-4 py-2 border-b">Fecha Nac.</th>
                <th className="px-4 py-2 border-b">Sexo</th>
                <th className="px-4 py-2 border-b">Documento</th>
                <th className="px-4 py-2 border-b">Teléfono</th>
                <th className="px-4 py-2 border-b">Dirección</th>
                <th className="px-4 py-2 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {patients?.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No hay pacientes registrados.
                  </td>
                </tr>
              )}
              {patients?.map((p: Patient) => (
                <tr key={p.id} className="hover:bg-teal-50">
                  <td className="px-4 py-2">{p.firstName}</td>
                  <td className="px-4 py-2">{p.lastName}</td>
                  <td className="px-4 py-2">{p.birthDate && new Date(p.birthDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{p.sex}</td>
                  <td className="px-4 py-2">{p.document}</td>
                  <td className="px-4 py-2">{p.phone}</td>
                  <td className="px-4 py-2">{p.address}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="text-teal-600 hover:underline"
                      onClick={() => handleEdit(p)}
                      disabled={updateMutation.isPending}
                      aria-label={`Editar paciente ${p.firstName} ${p.lastName}`}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(p.id)}
                      disabled={deleteMutation.isPending}
                      aria-label={`Eliminar paciente ${p.firstName} ${p.lastName}`}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}