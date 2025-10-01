'use client';

import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchDoctors,
  updateDoctor,
  toggleDoctorActive,
  DoctorEntity,
  filterDoctorsClient,
  CreateDoctorWithUserInput,
} from '@/lib/api/api.doctors';
import { useAuth } from '@/context/AuthContext';
import { useState, useMemo, useEffect } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { isActiveFromUser } from '@/lib/api/api';
import { useCreateDoctorWithUser } from '@/hooks/useCreateDoctorWithUser';
import DoctorsForm from '@/components/forms/DoctorsForm';

/**
 * NOTA IMPORTANTE:
 * - La inserción en caché después de crear un doctor se realiza EN EL HOOK useCreateDoctorWithUser
 *   (onSuccess) con deduplicación por id + invalidación posterior.
 * - Aquí ya NO volvemos a hacer setQueryData para evitar duplicados de keys.
 */

export default function DoctorsPage() {
  const { user: sessionUser } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editDoctor, setEditDoctor] = useState<DoctorEntity | null>(null);

  // Confirmación de creación
  const [showConfirmCreate, setShowConfirmCreate] = useState(false);
  const [pendingCreateData, setPendingCreateData] =
    useState<CreateDoctorWithUserInput | null>(null);

  // Diagnóstico de integridad de lista
  const [listIntegrityError, setListIntegrityError] = useState<string | null>(
    null,
  );

  // Búsqueda
  const [rawSearch, setRawSearch] = useState('');
  const debounced = useDebouncedValue(rawSearch, 300);
  const search = debounced.trim().toLowerCase();

  /* ================= Query listado ================= */
  const {
    data: doctors,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['doctors'],
    enabled: !!sessionUser,
    queryFn: fetchDoctors,
  });

  /* ================= Mutaciones ================= */
  const createCompositeMutation = useCreateDoctorWithUser();

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<DoctorEntity>;
    }) => updateDoctor(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['doctors'] });
      const prev = queryClient.getQueryData<DoctorEntity[]>(['doctors']);
      if (prev) {
        queryClient.setQueryData<DoctorEntity[]>(['doctors'], (old) =>
          old
            ? old.map((d) =>
                d.id === id
                  ? {
                      ...d,
                      specialty:
                        data.specialty !== undefined
                          ? data.specialty
                          : d.specialty,
                      license:
                        data.license !== undefined ? data.license : d.license,
                      bio: data.bio !== undefined ? data.bio : d.bio,
                    }
                  : d,
              )
            : old,
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['doctors'], ctx.prev);
    },
    onSuccess: (updated) => {
      // Merge final
      queryClient.setQueryData<DoctorEntity[]>(['doctors'], (old) =>
        old
          ? old.map((d) => (d.id === updated.id ? { ...d, ...updated } : d))
          : [updated],
      );
      setShowForm(false);
      setEditDoctor(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (doc: DoctorEntity) => toggleDoctorActive(doc),
    onMutate: async (doc) => {
      await queryClient.cancelQueries({ queryKey: ['doctors'] });
      const prev = queryClient.getQueryData<DoctorEntity[]>(['doctors']);
      if (prev) {
        queryClient.setQueryData<DoctorEntity[]>(['doctors'], (old) =>
          old
            ? old.map((d) =>
                d.id === doc.id
                  ? {
                      ...d,
                      user: d.user
                        ? {
                            ...d.user,
                            status:
                              d.user.status?.toUpperCase() === 'ACTIVE'
                                ? 'INACTIVE'
                                : 'ACTIVE',
                          }
                        : d.user,
                    }
                  : d,
              )
            : old,
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['doctors'], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });

  /* ================= Handlers ================= */
  function handleEdit(d: DoctorEntity) {
    setEditDoctor(d);
    setShowForm(true);
  }

  function handleToggle(d: DoctorEntity) {
    if (!d) return;
    statusMutation.mutate(d);
  }

  /* ================= Normalización + Dedupe ================= */
  const normalizedList: DoctorEntity[] | undefined = useMemo(() => {
    if (!doctors) return doctors;
    if (!Array.isArray(doctors)) {
      setListIntegrityError('La respuesta de doctores no es un array.');
      return [];
    }
    // Filtrar objetos válidos
    const valid = doctors.filter(
      (d): d is DoctorEntity =>
        !!d && typeof d === 'object' && typeof (d as any).id === 'string',
    );
    // Dedupe
    const seen = new Set<string>();
    const deduped: DoctorEntity[] = [];
    for (const doc of valid) {
      if (!seen.has(doc.id)) {
        seen.add(doc.id);
        deduped.push(doc);
      }
    }
    if (deduped.length !== valid.length) {
      console.warn(
        `[DoctorsPage] Eliminados ${
          valid.length - deduped.length
        } duplicados por id`,
      );
    }
    return deduped;
  }, [doctors]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEBUG] doctors raw:', doctors);
      console.log('[DEBUG] normalizedList:', normalizedList);
    }
  }, [doctors, normalizedList]);

  /* ================= Filtro ================= */
  const filtered = useMemo(
    () => filterDoctorsClient(normalizedList, search),
    [normalizedList, search],
  );

  /* ================= Estados combinados ================= */
  const submitting =
    createCompositeMutation.isPending ||
    updateMutation.isPending ||
    statusMutation.isPending;

  /* ================= Confirmación creación ================= */
  function requestCreateConfirmation(data: any) {
    if (!data?.user || !data?.doctor) {
      alert('Error: payload inválido del formulario (falta user/doctor).');
      return;
    }
    setPendingCreateData(data);
    setShowConfirmCreate(true);
  }

  function cancelCreateConfirmation() {
    setShowConfirmCreate(false);
    setPendingCreateData(null);
  }

  function confirmAndCreate() {
    if (!pendingCreateData) return;
    createCompositeMutation.mutate(pendingCreateData, {
      onSuccess: () => {
        // Hook ya hizo inserción + invalidación
        setPendingCreateData(null);
        setShowConfirmCreate(false);
        setShowForm(false);
        setEditDoctor(null);
      },
      onError: (err) => {
        console.error('Error creando doctor:', err);
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Encabezado y búsqueda */}
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

      {/* Mensajes estado */}
      {!sessionUser && <div>Inicia sesión para ver doctores.</div>}
      {isLoading && <div>Cargando doctores...</div>}
      {isError && <div className="text-red-600">Error: {String(error)}</div>}
      {listIntegrityError && (
        <div className="text-red-600">
          Error integridad lista: {listIntegrityError}
        </div>
      )}
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
            {filtered?.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  {search
                    ? 'No se encontraron doctores.'
                    : 'No hay doctores.'}
                </td>
              </tr>
            )}
            {filtered?.map((d) => {
              if (!d) return null;
              let active = false;
              try {
                active = d.user ? isActiveFromUser(d.user as any) : false;
              } catch (e) {
                console.warn('isActiveFromUser falló para d.id=', d.id, e);
              }
              return (
                <tr key={d.id} className="hover:bg-teal-50">
                  <td className="px-4 py-2">
                    {(d.user?.firstName || '-') + ' ' + (d.user?.lastName || '')}
                  </td>
                  <td className="px-4 py-2">{d.user?.email || '-'}</td>
                  <td className="px-4 py-2">{d.user?.phone || '-'}</td>
                  <td className="px-4 py-2">{d.specialty || '-'}</td>
                  <td className="px-4 py-2">{d.license || '-'}</td>
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
        {filtered?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {search ? 'No se encontraron doctores.' : 'No hay doctores.'}
          </div>
        )}
        {filtered?.map((d) => {
          if (!d) return null;
          let active = false;
          try {
            active = d.user ? isActiveFromUser(d.user as any) : false;
          } catch (e) {
            console.warn('isActiveFromUser falló (mobile) para d.id=', d.id, e);
          }
          return (
            <div key={d.id} className="border rounded shadow p-4 bg-white">
              <div className="font-bold text-lg">
                {(d.user?.firstName || '-') + ' ' + (d.user?.lastName || '')}
              </div>
              <div className="text-sm text-gray-700 space-y-1 mt-2">
                <div>
                  <span className="font-medium">Email:</span>{' '}
                  {d.user?.email || '-'}
                </div>
                <div>
                  <span className="font-medium">Tel:</span> {d.user?.phone || '-'}
                </div>
                <div>
                  <span className="font-medium">Especialidad:</span>{' '}
                  {d.specialty || '-'}
                </div>
                <div>
                  <span className="font-medium">Licencia:</span> {d.license || '-'}
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

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-2xl w-full">
            <DoctorsForm
              mode={editDoctor ? 'edit' : 'create'}
              initialDoctor={editDoctor || undefined}
              submitting={submitting || createCompositeMutation.isPending}
              onSubmit={(data: any) => {
                if (editDoctor) {
                  updateMutation.mutate({ id: editDoctor.id, data });
                } else {
                  requestCreateConfirmation(data);
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

      {/* Modal Confirmación */}
      {showConfirmCreate && pendingCreateData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded shadow p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Confirmar creación de doctor</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Nombre:</span>{' '}
                {pendingCreateData.user.firstName}{' '}
                {pendingCreateData.user.lastName}
              </p>
              <p>
                <span className="font-medium">Email:</span>{' '}
                {pendingCreateData.user.email}
              </p>
              <p>
                <span className="font-medium">Especialidad:</span>{' '}
                {pendingCreateData.doctor.specialty}
              </p>
              <p>
                <span className="font-medium">Licencia:</span>{' '}
                {pendingCreateData.doctor.license}
              </p>
              {pendingCreateData.doctor.bio && (
                <p>
                  <span className="font-medium">Bio:</span>{' '}
                  {pendingCreateData.doctor.bio}
                </p>
              )}
            </div>
            {createCompositeMutation.isError && (
              <div className="text-red-600 text-sm">
                {(createCompositeMutation.error as any)?.message ||
                  'Error al crear'}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={cancelCreateConfirmation}
                className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
                disabled={createCompositeMutation.isPending}
              >
                Cancelar
              </button>
              <button
                onClick={confirmAndCreate}
                disabled={createCompositeMutation.isPending}
                className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {createCompositeMutation.isPending
                  ? 'Creando...'
                  : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}