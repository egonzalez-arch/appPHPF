import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPatients,
  fetchPatientsWithSession,
  createPatient,
  changeUserActive,
  updatePatient,
  Patient,
  isActiveFromUser,
  User,
} from '@/lib/api/api';
import PatientForm from '@/components/forms/PatientForm';
import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

function formatDateForInput(value?: string | Date | null): string {
  if (!value) return '';
  try {
    const d = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(d.getTime())) return '';
    return d.toISOString().substring(0, 10);
  } catch {
    return '';
  }
}

function buildEmergencyContactText(ec: any): string {
  if (!ec) return '-';
  const parts: string[] = [];
  if (ec.name) parts.push(ec.name);
  if (ec.relation) parts.push(`(${ec.relation})`);
  if (ec.phone) parts.push(`Tel: ${ec.phone}`);
  return parts.length ? parts.join(' ') : '-';
}

export default function PatientsPageContent() {
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { user: sessionUser, accessToken } = useAuth();
  const queryClient = useQueryClient();

  const queryFn = useMemo(
    () => (accessToken ? () => fetchPatientsWithSession() : () => fetchPatients()),
    [accessToken],
  );

  const {
    data: patients,
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['patients'],
    enabled: !!sessionUser,
    queryFn,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: createPatient,
    onSuccess: (newPatient) => {
      queryClient.setQueryData<Patient[]>(['patients'], (old) =>
        old ? [...old, newPatient] : [newPatient],
      );
      setShowForm(false);
      setEditPatient(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Patient> }) =>
      updatePatient(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<Patient[]>(['patients'], (old) =>
        old ? old.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)) : [updated],
      );
      setShowForm(false);
      setEditPatient(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) =>
      changeUserActive(userId, active),
    onSuccess: () => {
      refetch();
    },
    onError: (err: any) => {
      console.error('Error al cambiar estado:', err?.message || err);
    },
  });

  function handleEdit(patient: Patient) {
    const prepared: Patient = {
      ...patient,
      birthDate: formatDateForInput(patient.birthDate as any) as any,
    };
    setEditPatient(prepared);
    setShowForm(true);
  }

  function handleToggleStatus(patient: Patient) {
    const active = isActiveFromUser(patient.user as User);
    const next = !active;
    const userId = patient.user?.id;
    if (!userId) {
      console.warn('Paciente sin usuario asociado, no se puede cambiar estado');
      return;
    }
    statusMutation.mutate({ userId, active: next });
  }

  function getFirstName(p: Patient) {
    return (p.user?.firstName as string) || p.firstName || (p as any).nombre || '-';
  }

  function getLastName(p: Patient) {
    return (p.user?.lastName as string) || p.lastName || (p as any).apellido || '-';
  }

  function StatusSwitch({ patient }: { patient: Patient }) {
    const checked = isActiveFromUser(patient.user as User);
    return (
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={statusMutation.isPending}
          onChange={() => handleToggleStatus(patient)}
        />
        <span
          className={`w-10 h-6 flex items-center rounded-full px-1 transition-colors ${
            checked ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              checked ? 'translate-x-4' : ''
            }`}
          />
        </span>
        <span
          className={`ml-2 text-sm font-semibold ${
            checked ? 'text-green-600' : 'text-gray-500'
          }`}
        >
          {checked ? 'Activo' : 'Inactivo'}
        </span>
      </label>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
            disabled={isSubmitting}
          >
            ➕ Nuevo Paciente
          </button>
        </div>

        {!sessionUser && (
          <div className="py-8 text-center text-gray-500">
            Inicia sesión para ver pacientes.
          </div>
        )}
        {isLoading && (
          <div className="py-8 text-center text-gray-500">Cargando pacientes...</div>
        )}
        {isError && (
          <div className="py-8 text-center text-red-600">
            Error: {String(error)}
          </div>
        )}

        {createMutation.isError && (
          <div className="text-red-600 mb-2">
            Error al crear paciente: {(createMutation.error as any)?.message || ''}
          </div>
        )}
        {updateMutation.isError && (
          <div className="text-red-600 mb-2">
            Error al actualizar paciente: {(updateMutation.error as any)?.message || ''}
          </div>
        )}
        {statusMutation.isError && (
          <div className="text-red-600 mb-2">
            Error al cambiar estado del paciente: {String((statusMutation.error as any)?.message || '')}
          </div>
        )}
        {createMutation.isSuccess && (
          <div className="text-green-600 mb-2">Paciente creado correctamente</div>
        )}
        {updateMutation.isSuccess && (
          <div className="text-green-600 mb-2">Paciente actualizado correctamente</div>
        )}
        {statusMutation.isSuccess && (
          <div className="text-green-600 mb-2">
            Estado de paciente actualizado correctamente
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
              <PatientForm
                mode={editPatient ? 'edit' : 'create'}
                initialValues={
                  editPatient
                    ? {
                        birthDate: editPatient.birthDate
                          ? formatDateForInput(editPatient.birthDate as any)
                          : '',
                        PatientSex: editPatient.PatientSex,
                        bloodType: editPatient.bloodType,
                        allergies: editPatient.allergies || [],
                        emergencyContact: editPatient.emergencyContact || undefined,
                      }
                    : undefined
                }
                submitting={isSubmitting}
                onSubmit={(data) => {
                  if (editPatient) {
                    updateMutation.mutate({
                      id: editPatient.id,
                      data: data as any,
                    });
                  } else {
                    createMutation.mutate(data as any);
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

        {/* Tabla desktop */}
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
                <th className="px-4 py-2 border-b">Contacto Emerg.</th>
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
              {patients?.map((p) => {
                const ecText = buildEmergencyContactText(p.emergencyContact);
                return (
                  <tr key={p.id} className="hover:bg-teal-50">
                    <td className="px-4 py-2">{getFirstName(p)}</td>
                    <td className="px-4 py-2">{getLastName(p)}</td>
                    <td className="px-4 py-2">
                      {p.birthDate && new Date(p.birthDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{p.PatientSex || '-'}</td>
                    <td className="px-4 py-2">{p.user?.phone || '-'}</td>
                    <td className="px-4 py-2">{p.bloodType || '-'}</td>
                    <td className="px-4 py-2">{p.user?.email || '-'}</td>
                    <td className="px-4 py-2">
                      {Array.isArray(p.allergies)
                        ? p.allergies.join(', ')
                        : p.allergies
                        ? String(p.allergies)
                        : '-'}
                    </td>
                    <td className="px-4 py-2">{ecText}</td>
                    <td className="px-4 py-2">
                      <StatusSwitch patient={p} />
                    </td>
                    <td className="px-4 py-2">
                      {p.user?.createdAt
                        ? new Date(p.user.createdAt as string).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        className="text-teal-600 hover:underline"
                        onClick={() => handleEdit(p)}
                        disabled={isSubmitting}
                        aria-label={`Editar paciente ${getFirstName(p)} ${getLastName(p)}`}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Vista móvil */}
        <div className="md:hidden flex flex-col gap-4 mt-2">
          {patients?.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              No hay pacientes registrados.
            </div>
          )}
          {patients?.map((p) => {
            const ecText = buildEmergencyContactText(p.emergencyContact);
            return (
              <div key={p.id} className="rounded border shadow p-4 bg-white">
                <div className="font-bold text-lg mb-2">
                  {getFirstName(p)} {getLastName(p)}
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>
                    <span className="font-medium">Fecha Nac.:</span>{' '}
                    {p.birthDate && new Date(p.birthDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Sexo:</span> {p.PatientSex || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Teléfono:</span> {p.user?.phone || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Tipo de Sangre:</span> {p.bloodType || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {p.user?.email || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Alergias:</span>{' '}
                    {Array.isArray(p.allergies)
                      ? p.allergies.join(', ')
                      : p.allergies
                      ? String(p.allergies)
                      : '-'}
                  </div>
                  <div>
                    <span className="font-medium">Contacto Emerg.:</span> {ecText}
                  </div>
                  <div className="mt-2">
                    <StatusSwitch patient={p} />
                  </div>
                  <div>
                    <span className="font-medium">Fecha registro:</span>{' '}
                    {p.user?.createdAt
                      ? new Date(p.user.createdAt as string).toLocaleDateString()
                      : '-'}
                  </div>
                </div>
                <div className="flex gap-4 mt-3">
                  <button
                    className="text-teal-600 hover:underline"
                    onClick={() => handleEdit(p)}
                    disabled={isSubmitting}
                    aria-label={`Editar paciente ${getFirstName(p)} ${getLastName(p)}`}
                  >
                    Editar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}