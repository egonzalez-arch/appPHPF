'use client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchPatients, createPatient, updatePatient, deletePatient, Patient } from '@/lib/api/api';
import PatientForm from '@/components/forms/PatientForm';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function PatientsPageContent() {
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const { data: patients, refetch, isLoading, isError, error } = useQuery({
    queryKey: ['patients'],
    enabled: !!user,
    queryFn: fetchPatients,
    retry: 1,
    
  });

  const createMutation = useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      refetch();
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) =>
      updatePatient(id, data),
    onSuccess: () => {
      refetch();
      setEditPatient(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => refetch(),
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

  // Función para mostrar nombre/apellido, cubre diferentes formatos
  function getFirstName(p: Patient) {
    return p.user?.firstName || p.nombre || '-';
    console.log(patients);
  }
  function getLastName(p: Patient) {
        return p.user?.lastName || p.apellido || '-';
  }

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 px-2 sm:px-6 lg:px-10 py-6 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <button
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 shadow"
            onClick={() => {
              setEditPatient(null);
              setShowForm(true);
            }}
            aria-label="Crear nuevo paciente"
          >
            ➕ Nuevo Paciente
          </button>
        </div>

        {!user && (
          <div className="py-8 text-center text-gray-500">Inicia sesión para ver pacientes.</div>
        )}
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
                onSubmit={(data) => {
                  
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

        {/* Tabla responsiva en desktop */}
        <div className="hidden md:block bg-white rounded shadow border mt-2 w-full overflow-x-auto">
          <table className="min-w-max border w-full">
            <thead>
              <tr className="bg-teal-100">
                <th className="px-4 py-2 border-b">Nombre</th>
                <th className="px-4 py-2 border-b">Apellido</th>
                <th className="px-4 py-2 border-b">Fecha Nac.</th>
                <th className="px-4 py-2 border-b">Sexo</th>
                <th className="px-4 py-2 border-b">Teléfono</th>
                <th className="px-4 py-2 border-b">Tipo de Sangre</th>
                <th className="px-4 py-2 border-b">Email</th>
                <th className="px-4 py-2 border-b">Alergias</th>
                <th className="px-4 py-2 border-b">Estado</th>
                <th className="px-4 py-2 border-b">Fecha registro</th>
                <th className="px-4 py-2 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {patients?.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-gray-500">
                    No hay pacientes registrados.
                  </td>
                </tr>
              )}
              {patients?.map((p: Patient) => (
                <tr key={p.id} className="hover:bg-teal-50">
                  <td className="px-4 py-2">{getFirstName(p)}</td>
                  <td className="px-4 py-2">{getLastName(p)}</td>
                  <td className="px-4 py-2">{p.birthDate && new Date(p.birthDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{p.PatientSex || '-'}</td>
                  <td className="px-4 py-2">{p.user?.phone || '-'}</td>
                  <td className="px-4 py-2">{p.bloodType || '-'}</td>
                  <td className="px-4 py-2">{p.user?.email || '-'}</td>
                  <td className="px-4 py-2">{p.allergies || '-'}</td>
                  <td className="px-4 py-2">{p.user?.status || '-'}</td>
                  <td className="px-4 py-2">{p.user?.createdAt ? new Date(p.user.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="text-teal-600 hover:underline"
                      onClick={() => handleEdit(p)}
                      disabled={updateMutation.isPending}
                      aria-label={`Editar paciente ${getFirstName(p)} ${getLastName(p)}`}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(p.id)}
                      disabled={deleteMutation.isPending}
                      aria-label={`Eliminar paciente ${getFirstName(p)} ${getLastName(p)}`}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vista tipo tarjeta en móvil */}
        <div className="md:hidden flex flex-col gap-4 mt-2">
          {patients?.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              No hay pacientes registrados.
            </div>
          )}
          {patients?.map((p: Patient) => (
            <div key={p.id} className="rounded border shadow p-4 bg-white">
              <div className="font-bold text-lg mb-2">
                {getFirstName(p)} {getLastName(p)}
              </div>
              <div className="text-sm text-gray-700">
                <div><span className="font-medium">Fecha Nac.:</span> {p.birthDate && new Date(p.birthDate).toLocaleDateString()}</div>
                <div><span className="font-medium">Sexo:</span> {p.PatientSex || '-'}</div>
                <div><span className="font-medium">Teléfono:</span> {p.phone || '-'}</div>
                <div><span className="font-medium">Dirección:</span> {p.address || '-'}</div>
                <div><span className="font-medium">Email:</span> {p.user?.email || '-'}</div>
                <div><span className="font-medium">Usuario:</span> {p.user?.username || '-'}</div>
                <div><span className="font-medium">Telefono:</span> {p.user?.phone || '-'}</div>
                <div><span className="font-medium">Fecha registro:</span> {p.user?.createdAt ? new Date(p.user.createdAt).toLocaleDateString() : '-'}</div>
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  className="text-teal-600 hover:underline"
                  onClick={() => handleEdit(p)}
                  disabled={updateMutation.isPending}
                  aria-label={`Editar paciente ${getFirstName(p)} ${getLastName(p)}`}
                >
                  Editar
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(p.id)}
                  disabled={deleteMutation.isPending}
                  aria-label={`Eliminar paciente ${getFirstName(p)} ${getLastName(p)}`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}