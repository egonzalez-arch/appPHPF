'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  CompanyEntity,
} from '@/hooks/useCompanies';
import CompanyForm from '@/components/forms/CompanyForm';

export default function CompaniesPage() {
  const { user: sessionUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editCompany, setEditCompany] = useState<CompanyEntity | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CompanyEntity | null>(null);

  const [rawSearch, setRawSearch] = useState('');
  const debounced = useDebouncedValue(rawSearch, 300);
  const search = debounced.trim().toLowerCase();

  const { data: companies, isLoading, isError, error } = useCompanies();

  const createMut = useCreateCompany();
  const updateMut = useUpdateCompany();
  const deleteMut = useDeleteCompany();

  const filtered = useMemo(() => {
    if (!companies) return [];
    if (!search) return companies;
    return companies.filter(c =>
      [c.name, c.address, c.email, c.phone]
        .filter(Boolean)
        .some(v => (v as string).toLowerCase().includes(search)),
    );
  }, [companies, search]);

  const submitting =
    createMut.isPending || updateMut.isPending || deleteMut.isPending;

  function handleSubmit(data: any) {
    if (editCompany) {
      updateMut.mutate(
        { id: editCompany.id, data },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditCompany(null);
          },
        },
      );
    } else {
      createMut.mutate(data, {
        onSuccess: () => {
          setShowForm(false);
        },
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:items-center">
          <div className="relative flex-1 md:min-w-[280px]">
            <input
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              placeholder="Buscar (nombre, dirección, email...)"
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
          <button
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 shadow"
            disabled={submitting}
            onClick={() => {
              setEditCompany(null);
              setShowForm(true);
            }}
          >
            ➕ Nueva Empresa
          </button>
        </div>
      </div>

      {!sessionUser && <div>Inicia sesión para ver empresas.</div>}
      {isLoading && <div>Cargando empresas...</div>}
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
              <th className="px-4 py-2 border-b">Dirección</th>
              <th className="px-4 py-2 border-b">Teléfono</th>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Creado</th>
              <th className="px-4 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  {search ? 'No se encontraron empresas.' : 'No hay empresas.'}
                </td>
              </tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-teal-50">
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">{c.address}</td>
                <td className="px-4 py-2">{c.phone || '-'}</td>
                <td className="px-4 py-2">{c.email || '-'}</td>
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
                      setEditCompany(c);
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
            {search ? 'No se encontraron empresas.' : 'No hay empresas.'}
          </div>
        )}
        {filtered.map(c => (
          <div key={c.id} className="border rounded shadow p-4 bg-white">
            <div className="font-bold text-lg">{c.name}</div>
            <div className="text-sm text-gray-700 space-y-1 mt-2">
              <div><span className="font-medium">Dirección:</span> {c.address}</div>
              <div><span className="font-medium">Tel:</span> {c.phone || '-'}</div>
              <div><span className="font-medium">Email:</span> {c.email || '-'}</div>
              <div>
                <span className="font-medium">Creado:</span>{' '}
                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}
              </div>
            </div>
            <div className="flex gap-4 mt-3 items-center">
              <button
                className="text-teal-600 hover:underline"
                onClick={() => {
                  setEditCompany(c);
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
            <CompanyForm
              mode={editCompany ? 'edit' : 'create'}
              initialCompany={editCompany || undefined}
              submitting={submitting}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditCompany(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded shadow max-w-md w-full space-y-4">
            <h2 className="text-lg font-semibold">Eliminar empresa</h2>
            <p className="text-sm text-gray-700">
              ¿Seguro que deseas eliminar “{confirmDelete.name}”? Esta acción no se puede deshacer.
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
                    { onSuccess: () => setConfirmDelete(null) },
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