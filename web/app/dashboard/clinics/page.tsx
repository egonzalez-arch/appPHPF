'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  useClinics,
  useCreateClinic,
  useUpdateClinic,
  useDeleteClinic,
  ClinicEntity,
} from '@/hooks/useClinics';
import { useCompaniesLite } from '@/hooks/useCompaniesLite';
import ClinicForm from '@/components/forms/ClinicForm';

interface PendingCreateClinic {
  companyId: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  openingHours?: string;
}

export default function ClinicsPage() {
  const { user: sessionUser } = useAuth();

  // Form & edit states
  const [showForm, setShowForm] = useState(false);
  const [editClinic, setEditClinic] = useState<ClinicEntity | null>(null);

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<ClinicEntity | null>(null);

  // Create confirmation
  const [showConfirmCreate, setShowConfirmCreate] = useState(false);
  const [pendingCreateData, setPendingCreateData] =
    useState<PendingCreateClinic | null>(null);

  // Success feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [rawSearch, setRawSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const debounced = useDebouncedValue(rawSearch, 300);
  const search = debounced.trim().toLowerCase();

  // Data
  const { data: clinics, isLoading, isError, error } = useClinics(
    undefined, // search server-side si quisieras
    selectedCompany || undefined,
  );
  const {
    data: companies,
    isLoading: loadingCompanies,
    isError: errorCompanies,
  } = useCompaniesLite(true);

  // Mutations
  const createMut = useCreateClinic();
  const updateMut = useUpdateClinic();
  const deleteMut = useDeleteClinic();

  // Derived filtered list (client-side search)
  const filtered = useMemo(() => {
    if (!clinics) return [];
    if (!search) return clinics;
    return clinics.filter((c) =>
      [c.name, c.address, c.email, c.phone, c.openingHours, c.company?.name]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(search)),
    );
  }, [clinics, search]);

  const submitting =
    createMut.isPending || updateMut.isPending || deleteMut.isPending;

  // Auto clear success message
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  function handleSubmit(data: any) {
    if (editClinic) {
      // Update flow
      updateMut.mutate(
        { id: editClinic.id, data },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditClinic(null);
            setSuccessMessage('Clínica actualizada correctamente.');
          },
        },
      );
    } else {
      // Create flow -> intercept to confirm
      setPendingCreateData(data);
      setShowConfirmCreate(true);
    }
  }

  function cancelCreateConfirmation() {
    if (createMut.isPending) return;
    setShowConfirmCreate(false);
    setPendingCreateData(null);
  }

  function confirmCreate() {
    if (!pendingCreateData) return;
    createMut.mutate(pendingCreateData, {
      onSuccess: () => {
        // Hook ya actualiza la lista (inserción + invalidación)
        setShowConfirmCreate(false);
        setPendingCreateData(null);
        setShowForm(false);
        setEditClinic(null);
        setSuccessMessage('Clínica creada correctamente.');
      },
    });
  }

  function clinicCompanyName(companyId: string) {
    return companies?.find((c) => c.id === companyId)?.name || companyId;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Clínicas</h1>
        <div className="flex flex-col lg:flex-row gap-3 w-full md:w-auto md:items-center">
          {/* Búsqueda */}
          <div className="relative flex-1 md:min-w-[240px]">
            <input
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              placeholder="Buscar (nombre, dirección, email, horario...)"
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
          </div>

          {/* Filtro por empresa */}
          <div className="flex flex-col min-w-[200px]">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="border px-3 py-2 rounded bg-white"
              disabled={loadingCompanies || errorCompanies}
            >
              <option value="">Todas las empresas</option>
              {companies?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {loadingCompanies && (
              <span className="text-xs text-gray-500 mt-1">
                Cargando empresas...
              </span>
            )}
            {errorCompanies && (
              <span className="text-xs text-red-600 mt-1">
                Error cargando empresas
              </span>
            )}
          </div>

            <button
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 shadow"
            disabled={submitting}
            onClick={() => {
              setEditClinic(null);
              setShowForm(true);
            }}
          >
            ➕ Nueva Clínica
          </button>
        </div>
      </div>

      {/* Mensajes superiores */}
      {!sessionUser && <div>Inicia sesión para ver clínicas.</div>}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded text-sm">
          {successMessage}
        </div>
      )}
      {isLoading && <div>Cargando clínicas...</div>}
      {isError && <div className="text-red-600">Error: {String(error)}</div>}

      {createMut.isError && (
        <div className="text-red-600">
          Error al crear: {(createMut.error as any)?.message}
        </div>
      )}
      {updateMut.isError && (
        <div className="text-red-600">
          Error al actualizar: {(updateMut.error as any)?.message}
        </div>
      )}
      {deleteMut.isError && (
        <div className="text-red-600">
          Error al eliminar: {(deleteMut.error as any)?.message}
        </div>
      )}

      {/* Tabla Desktop */}
      <div className="hidden md:block bg-white rounded shadow border overflow-x-auto">
        <table className="min-w-max w-full">
          <thead>
            <tr className="bg-teal-100">
              <th className="px-4 py-2 border-b">Nombre</th>
              <th className="px-4 py-2 border-b">Empresa</th>
              <th className="px-4 py-2 border-b">Dirección</th>
              <th className="px-4 py-2 border-b">Teléfono</th>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Horario</th>
              <th className="px-4 py-2 border-b">Creado</th>
              <th className="px-4 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  {search || selectedCompany
                    ? 'No se encontraron clínicas.'
                    : 'No hay clínicas.'}
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-teal-50">
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">{c.company?.name || c.companyId}</td>
                <td className="px-4 py-2">{c.address}</td>
                <td className="px-4 py-2">{c.phone || '-'}</td>
                <td className="px-4 py-2">{c.email || '-'}</td>
                <td className="px-4 py-2">{c.openingHours || '-'}</td>
                <td className="px-4 py-2">
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString()
                    : '-'}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    className="text-teal-600 hover:underline"
                    disabled={submitting}
                    onClick={() => {
                      setEditClinic(c);
                      setShowForm(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    disabled={submitting}
                    onClick={() => setConfirmDelete(c)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <div className="md:hidden flex flex-col gap-4">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {search || selectedCompany
              ? 'No se encontraron clínicas.'
              : 'No hay clínicas.'}
          </div>
        )}
        {filtered.map((c) => (
          <div key={c.id} className="border rounded shadow p-4 bg-white">
            <div className="font-bold text-lg">{c.name}</div>
            <div className="text-sm text-gray-700 space-y-1 mt-2">
              <div>
                <span className="font-medium">Empresa:</span>{' '}
                {c.company?.name || c.companyId}
              </div>
              <div>
                <span className="font-medium">Dirección:</span> {c.address}
              </div>
              <div>
                <span className="font-medium">Tel:</span> {c.phone || '-'}
              </div>
              <div>
                <span className="font-medium">Email:</span> {c.email || '-'}
              </div>
              <div>
                <span className="font-medium">Horario:</span>{' '}
                {c.openingHours || '-'}
              </div>
              <div>
                <span className="font-medium">Creado:</span>{' '}
                {c.createdAt
                  ? new Date(c.createdAt).toLocaleDateString()
                  : '-'}
              </div>
            </div>
            <div className="flex gap-4 mt-3 items-center">
              <button
                className="text-teal-600 hover:underline"
                onClick={() => {
                  setEditClinic(c);
                  setShowForm(true);
                }}
                disabled={submitting}
              >
                Editar
              </button>
              <button
                className="text-red-600 hover:underline"
                onClick={() => setConfirmDelete(c)}
                disabled={submitting}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-2xl w-full">
            <ClinicForm
              mode={editClinic ? 'edit' : 'create'}
              initialClinic={editClinic || undefined}
              submitting={submitting || createMut.isPending}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditClinic(null);
                setPendingCreateData(null);
                setShowConfirmCreate(false);
              }}
              allowChangeCompanyOnEdit={false}
            />
          </div>
        </div>
      )}

      {/* Confirmación creación */}
      {showConfirmCreate && pendingCreateData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded shadow p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-semibold">
              Confirmar creación de clínica
            </h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Empresa:</span>{' '}
                {clinicCompanyName(pendingCreateData.companyId)}
              </p>
              <p>
                <span className="font-medium">Nombre:</span>{' '}
                {pendingCreateData.name}
              </p>
              <p>
                <span className="font-medium">Dirección:</span>{' '}
                {pendingCreateData.address}
              </p>
              {pendingCreateData.phone && (
                <p>
                  <span className="font-medium">Teléfono:</span>{' '}
                  {pendingCreateData.phone}
                </p>
              )}
              {pendingCreateData.email && (
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  {pendingCreateData.email}
                </p>
              )}
              {pendingCreateData.openingHours && (
                <p>
                  <span className="font-medium">Horario:</span>{' '}
                  {pendingCreateData.openingHours}
                </p>
              )}
            </div>
            {createMut.isError && (
              <div className="text-red-600 text-sm">
                {(createMut.error as any)?.message || 'Error al crear'}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={cancelCreateConfirmation}
                className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
                disabled={createMut.isPending}
              >
                Cancelar
              </button>
              <button
                onClick={confirmCreate}
                disabled={createMut.isPending}
                className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {createMut.isPending ? 'Creando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded shadow p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-semibold">Eliminar clínica</h2>
            <p className="text-sm text-gray-700">
              ¿Seguro que deseas eliminar “{confirmDelete.name}”? Esta acción no
              se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
                onClick={() => setConfirmDelete(null)}
                disabled={deleteMut.isPending}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                onClick={() =>
                  deleteMut.mutate(
                    { id: confirmDelete.id },
                    {
                      onSuccess: () => {
                        setConfirmDelete(null);
                        setSuccessMessage('Clínica eliminada.');
                      },
                    },
                  )
                }
                disabled={deleteMut.isPending}
              >
                {deleteMut.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}