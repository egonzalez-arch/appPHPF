'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchDoctors,
  createDoctorWithUser,
  updateDoctor,
  toggleDoctorActive,
  DoctorEntity,
  filterDoctorsClient,
} from '@/lib/api/api.doctors';
import { useAuth } from '@/context/AuthContext';
import DoctorsForm from '@/components/forms/DoctorsForm';
import { useState, useMemo } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { isActiveFromUser } from '@/lib/api/api';

export default function DoctorsPage() {
  const { user: sessionUser } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editDoctor, setEditDoctor] = useState<DoctorEntity | null>(null);

  const [rawSearch, setRawSearch] = useState('');
  const debounced = useDebouncedValue(rawSearch, 300);
  const search = debounced.trim().toLowerCase();

  const {
    data: doctors,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['doctors'],
    enabled: !!sessionUser,
    queryFn: fetchDoctors,
  });

  const createMutation = useMutation({
    mutationFn: createDoctorWithUser,
    onSuccess: (d) => {
      queryClient.setQueryData<DoctorEntity[]>(['doctors'], (old) =>
        old ? [d, ...old] : [d],
      );
      setShowForm(false);
      setEditDoctor(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<DoctorEntity>;
    }) => updateDoctor(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<DoctorEntity[]>(['doctors'], (old) =>
        old
          ? old.map((d) => (d.id === updated.id ? { ...d, ...updated } : d))
          : [updated],
      );
      setShowForm(false);
      setEditDoctor(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (doc: DoctorEntity) => toggleDoctorActive(doc),
    onSuccess: () => refetch(),
  });

  function handleEdit(d: DoctorEntity) {
    setEditDoctor(d);
    setShowForm(true);
  }

  function handleToggle(d: DoctorEntity) {
    statusMutation.mutate(d);
  }

  const filtered = useMemo(
    () => filterDoctorsClient(doctors, search),
    [doctors, search],
  );

  const submitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    statusMutation.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Doctores</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:items-center">
          <div className="relative flex-1 md:min-w-[280px]">
            <input
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              placeholder="Buscar (nombre, email, especialidad, licencia...)"
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
              setEditDoctor(null);
              setShowForm(true);
            }}
          >
            ➕ Nuevo Doctor
          </button>
        </div>
      </div>

      {!sessionUser && <div>Inicia sesión para ver doctores.</div>}
      {isLoading && <div>Cargando doctores...</div>}
      {isError && <div className="text-red-600">Error: {String(error)}</div>}

      {createMutation.isError && (
        <div className="text-red-600">
          Error al crear: {(createMutation.error as any)?.message}
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

      {/* Tabla Desktop */}
      <div className="hidden md:block bg-white rounded shadow border overflow-x-auto">
        <table className="min-w-max w-full">
          <thead>
            <tr className="bg-teal-100">
              <th className="px-4 py-2 border-b">Nombre</th>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Teléfono</th>
              <th className="px-4 py-2 border-b">Especialidad</th>
              <th className="px-4 py-2 border-b">Licencia</th>
              <th className="px-4 py-2 border-b">Estado</th>
              <th className="px-4 py-2 border-b">Creado</th>
              <th className="px-4 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  {search
                    ? 'No se encontraron doctores.'
                    : 'No hay doctores.'}
                </td>
              </tr>
            )}
            {filtered.map((d) => {
              const active = isActiveFromUser(d.user as any);
              return (
                <tr key={d.id} className="hover:bg-teal-50">
                  <td className="px-4 py-2">
                    {(d.user?.firstName || '-') + ' ' + (d.user?.lastName || '')}
                  </td>
                  <td className="px-4 py-2">{d.user?.email}</td>
                  <td className="px-4 py-2">{d.user?.phone || '-'}</td>
                  <td className="px-4 py-2">{d.specialty}</td>
                  <td className="px-4 py-2">{d.license}</td>
                  <td className="px-4 py-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={active}
                        disabled={statusMutation.isPending}
                        onChange={() => handleToggle(d)}
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
                  <td className="px-4 py-2">
                    {d.createdAt
                      ? new Date(d.createdAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="text-teal-600 hover:underline"
                      onClick={() => handleEdit(d)}
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

      {/* Tarjetas móvil */}
      <div className="md:hidden flex flex-col gap-4">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {search ? 'No se encontraron doctores.' : 'No hay doctores.'}
          </div>
        )}
        {filtered.map((d) => {
          const active = isActiveFromUser(d.user as any);
          return (
            <div key={d.id} className="border rounded shadow p-4 bg-white">
              <div className="font-bold text-lg">
                {(d.user?.firstName || '-') + ' ' + (d.user?.lastName || '')}
              </div>
              <div className="text-sm text-gray-700 space-y-1 mt-2">
                <div>
                  <span className="font-medium">Email:</span> {d.user?.email}
                </div>
                <div>
                  <span className="font-medium">Tel:</span> {d.user?.phone || '-'}
                </div>
                <div>
                  <span className="font-medium">Especialidad:</span>{' '}
                  {d.specialty}
                </div>
                <div>
                  <span className="font-medium">Licencia:</span> {d.license}
                </div>
                <div>
                  <span className="font-medium">Estado:</span>{' '}
                  {active ? 'Activo' : 'Inactivo'}
                </div>
              </div>
              <div className="flex gap-4 mt-3 items-center">
                <button
                  className="text-teal-600 hover:underline"
                  onClick={() => handleEdit(d)}
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
                    onChange={() => handleToggle(d)}
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
            <DoctorsForm
              mode={editDoctor ? 'edit' : 'create'}
              initialDoctor={editDoctor || undefined}
              submitting={submitting}
              onSubmit={(data) => {
                if (editDoctor) {
                  updateMutation.mutate({ id: editDoctor.id, data });
                } else {
                  createMutation.mutate(data);
                }
              }}
              onCancel={() => {
                setShowForm(false);
                setEditDoctor(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}