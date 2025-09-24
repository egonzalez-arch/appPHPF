'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPatients,
  updatePatient,
  changeUserActive,
  isActiveFromUser,
  Patient,
  User,
} from '@/lib/api/api';
import { createPatientWithUser } from '@/lib/api/createPatientWithUser';
import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import PatientForm from '@/components/forms/PatientForm';

function buildEmergencyContactText(ec: any): string {
  if (!ec) return '-';
  if (typeof ec === 'string') {
    try { ec = JSON.parse(ec); } catch { return '-'; }
  }
  if (typeof ec !== 'object' || Array.isArray(ec)) return '-';
  const parts: string[] = [];
  if (ec.name) parts.push(ec.name);
  if (ec.relation) parts.push(`(${ec.relation})`);
  if (ec.phone) parts.push(`Tel: ${ec.phone}`);
  return parts.length ? parts.join(' ') : '-';
}

export default function PatientsPageContent() {
  const { user: sessionUser } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);

  // Búsqueda
  const [rawSearch, setRawSearch] = useState('');
  const debounced = useDebouncedValue(rawSearch, 300);
  const search = debounced.trim().toLowerCase();

  const {
    data: patients,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['patients'],
    enabled: !!sessionUser,
    queryFn: fetchPatients,
  });

  // Crear (usuario + paciente)
  const createCompositeMutation = useMutation({
    mutationFn: createPatientWithUser,
    onSuccess: (p) => {
      queryClient.setQueryData<Patient[]>(['patients'], (old) =>
        old ? [...old, p] : [p],
      );
      setShowForm(false);
      setEditPatient(null);
    },
  });

  // Actualizar solo paciente
  const updateMutation = useMutation({
    mutationFn: async (args: { id: string; data: Partial<Patient> }) =>
      updatePatient(args.id, args.data),
    onSuccess: (updated) => {
      queryClient.setQueryData<Patient[]>(['patients'], (old) =>
        old
          ? old.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
          : [updated],
      );
      setShowForm(false);
      setEditPatient(null);
    },
  });

  // Estado usuario (activo/inactivo)
  const statusMutation = useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) =>
      changeUserActive(userId, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  });

  function getFirstName(p: Patient) {
    return p.user?.firstName || p.firstName || (p as any).nombre || '-';
  }
  function getLastName(p: Patient) {
    return p.user?.lastName || p.lastName || (p as any).apellido || '-';
  }

  function handleEdit(p: Patient) {
    setEditPatient({
      ...p,
      birthDate: p.birthDate || '',
    } as any);
    setShowForm(true);
  }

  function handleToggle(p: Patient) {
    const active = isActiveFromUser(p.user as User);
    const userId = p.user?.id;
    if (!userId) return;
    statusMutation.mutate({ userId, active: !active });
  }

  function buildIndex(p: Patient): string {
    const ec = buildEmergencyContactText(p.emergencyContact);
    return [
      getFirstName(p),
      getLastName(p),
      p.user?.email,
      p.user?.phone,
      p.PatientSex,
      p.bloodType,
      Array.isArray(p.allergies) ? p.allergies.join(' ') : '',
      ec,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
  }

  const filtered = useMemo(() => {
    if (!patients) return [];
    if (!search) return patients;
    return patients.filter((p) => buildIndex(p).includes(search));
  }, [patients, search]);

  const submitting =
    createCompositeMutation.isPending ||
    updateMutation.isPending ||
    statusMutation.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Pacientes</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:items-center">
          <div className="relative flex-1 md:min-w-[280px]">
            <input
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              placeholder="Buscar (nombre, email, sangre, contacto...)"
              className="w-full border rounded px-3 py-2 pr-9 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {rawSearch && (
              <button
                type="button"
                onClick={() => setRawSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
            {rawSearch && rawSearch !== debounced && (
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 animate-pulse">
                Filtrando...
              </span>
            )}
          </div>
          <button
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 shadow"
            disabled={submitting}
            onClick={() => {
              setEditPatient(null);
              setShowForm(true);
            }}
          >
            ➕ Nuevo Paciente
          </button>
        </div>
      </div>

      {!sessionUser && <div>Inicia sesión para ver pacientes.</div>}
      {isLoading && <div>Cargando pacientes...</div>}
      {isError && <div className="text-red-600">Error: {String(error)}</div>}

      {createCompositeMutation.isError && (
        <div className="text-red-600">
          Error al crear: {(createCompositeMutation.error as any)?.message}
        </div>
      )}
      {updateMutation.isError && (
        <div className="text-red-600">
          Error al actualizar: {(updateMutation.error as any)?.message}
        </div>
      )}
      {statusMutation.isError && (
        <div className="text-red-600">
          Error al cambiar estado: {(statusMutation.error as any)?.message}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded shadow border">
        <table className="w-full">
          <thead>
            <tr className="bg-teal-100">
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Apellido</th>
              <th className="px-3 py-2">Fecha Nac.</th>
              <th className="px-3 py-2">Sexo</th>
              <th className="px-3 py-2">Teléfono</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Tipo Sangre</th>
              <th className="px-3 py-2">Alergias</th>
              <th className="px-3 py-2">Contacto Emerg.</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-6 text-gray-500">
                  {search
                    ? 'No se encontraron pacientes con ese criterio.'
                    : 'No hay pacientes.'}
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const ec = buildEmergencyContactText(p.emergencyContact);
              const active = isActiveFromUser(p.user as User);
              return (
                <tr key={p.id} className="hover:bg-teal-50">
                  <td className="px-3 py-2">{getFirstName(p)}</td>
                  <td className="px-3 py-2">{getLastName(p)}</td>
                  <td className="px-3 py-2">
                    {p.birthDate
                      ? new Date(p.birthDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-3 py-2">{p.PatientSex || '-'}</td>
                  <td className="px-3 py-2">{p.user?.phone || '-'}</td>
                  <td className="px-3 py-2">{p.user?.email || '-'}</td>
                  <td className="px-3 py-2">{p.bloodType || '-'}</td>
                  <td className="px-3 py-2">
                    {Array.isArray(p.allergies)
                      ? p.allergies.join(', ')
                      : p.allergies
                      ? String(p.allergies)
                      : '-'}
                  </td>
                  <td className="px-3 py-2">{ec}</td>
                  <td className="px-3 py-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={active}
                        disabled={statusMutation.isPending}
                        onChange={() => handleToggle(p)}
                      />
                      <span
                        className={`w-10 h-5 flex items-center rounded-full px-1 transition-colors ${
                          active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                            active ? 'translate-x-4' : ''
                          }`}
                        />
                      </span>
                    </label>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      className="text-teal-600 hover:underline"
                      onClick={() => handleEdit(p)}
                      disabled={submitting}
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
      <div className="md:hidden flex flex-col gap-4">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {search ? 'No se encontraron pacientes.' : 'No hay pacientes.'}
          </div>
        )}
        {filtered.map((p) => {
          const ec = buildEmergencyContactText(p.emergencyContact);
          const active = isActiveFromUser(p.user as User);
          return (
            <div key={p.id} className="border rounded shadow p-4 bg-white">
              <div className="font-bold text-lg">
                {getFirstName(p)} {getLastName(p)}
              </div>
              <div className="text-sm text-gray-700 space-y-1 mt-2">
                <div>
                  <span className="font-medium">Fecha Nac.:</span>{' '}
                  {p.birthDate
                    ? new Date(p.birthDate).toLocaleDateString()
                    : '-'}
                </div>
                <div>
                  <span className="font-medium">Sexo:</span>{' '}
                  {p.PatientSex || '-'}
                </div>
                <div>
                  <span className="font-medium">Tel:</span>{' '}
                  {p.user?.phone || '-'}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{' '}
                  {p.user?.email || '-'}
                </div>
                <div>
                  <span className="font-medium">Sangre:</span>{' '}
                  {p.bloodType || '-'}
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
                  <span className="font-medium">Contacto:</span> {ec}
                </div>
                <div>
                  <span className="font-medium">Estado:</span>{' '}
                  {active ? 'Activo' : 'Inactivo'}
                </div>
              </div>
              <div className="flex gap-4 mt-3 items-center">
                <button
                  className="text-teal-600 hover:underline"
                  onClick={() => handleEdit(p)}
                  disabled={submitting}
                >
                  Editar
                </button>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={active}
                    disabled={statusMutation.isPending}
                    onChange={() => handleToggle(p)}
                  />
                  <span
                    className={`w-10 h-5 flex items-center rounded-full px-1 transition-colors ${
                      active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
                        active ? 'translate-x-4' : ''
                      }`}
                    />
                  </span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-2xl w-full">
            <PatientForm
              mode={editPatient ? 'edit' : 'create'}
              initialValues={
                editPatient
                  ? {
                      birthDate: editPatient.birthDate,
                      PatientSex: editPatient.PatientSex,
                      bloodType: editPatient.bloodType,
                      allergies: editPatient.allergies || [],
                      emergencyContact: editPatient.emergencyContact,
                    }
                  : undefined
              }
              submitting={submitting}
              onSubmit={(data: any) => {
                if (editPatient) {
                  updateMutation.mutate({ id: editPatient.id, data });
                } else {
                  // data.user & data.patient
                  if (data?.user && data?.patient) {
                    createCompositeMutation.mutate(data);
                  } else {
                    alert('Error: payload inválido del formulario.');
                  }
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
    </div>
  );
}