'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUsers,
  createUser,
  updateUser,
  updateUserStatus,
  UserEntity,
  isActiveFromUserEntity,
  filterUsersClientSide,
} from '@/lib/api/api.users';
import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import UsersForm from '@/components/forms/UsersForm';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export default function UsersPage() {
  const { user: sessionUser } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<UserEntity | null>(null);

  // Búsqueda
  const [rawSearch, setRawSearch] = useState('');
  const debounced = useDebouncedValue(rawSearch, 300);
  const search = debounced.trim().toLowerCase();

  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    enabled: !!sessionUser,
    queryFn: fetchUsers,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (u) => {
      queryClient.setQueryData<UserEntity[]>(['users'], (old) =>
        old ? [...old, u] : [u],
      );
      setShowForm(false);
      setEditUser(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserEntity> }) =>
      updateUser(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<UserEntity[]>(['users'], (old) =>
        old
          ? old.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
          : [updated],
      );
      setShowForm(false);
      setEditUser(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) =>
      updateUserStatus(userId, active),
    onSuccess: () => refetch(),
  });

  function handleEdit(u: UserEntity) {
    setEditUser(u);
    setShowForm(true);
  }

  function handleToggleActive(u: UserEntity) {
    const active = isActiveFromUserEntity(u);
    statusMutation.mutate({ userId: u.id, active: !active });
  }

  const filtered = useMemo(
    () => filterUsersClientSide(users, search),
    [users, search],
  );

  const submitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    statusMutation.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:items-center">
          <div className="relative flex-1 md:min-w-[280px]">
            <input
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              placeholder="Buscar (nombre, email, rol...)"
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
              setEditUser(null);
              setShowForm(true);
            }}
          >
            ➕ Nuevo Usuario
          </button>
        </div>
      </div>

      {!sessionUser && <div>Inicia sesión para ver usuarios.</div>}
      {isLoading && <div>Cargando usuarios...</div>}
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

      {/* Tabla desktop */}
      <div className="hidden md:block bg-white rounded shadow border overflow-x-auto">
        <table className="min-w-max w-full">
          <thead>
            <tr className="bg-teal-100">
              <th className="px-4 py-2 border-b">Nombre</th>
              <th className="px-4 py-2 border-b">Apellido</th>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Teléfono</th>
              <th className="px-4 py-2 border-b">Rol</th>
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
                    ? 'No se encontraron usuarios.'
                    : 'No hay usuarios.'}
                </td>
              </tr>
            )}
            {filtered.map((u) => {
              const active = isActiveFromUserEntity(u);
              return (
                <tr key={u.id} className="hover:bg-teal-50">
                  <td className="px-4 py-2">
                    {u.firstName || u.firstname || '-'}
                  </td>
                  <td className="px-4 py-2">{u.lastName || '-'}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.phone || '-'}</td>
                  <td className="px-4 py-2">{u.role || '-'}</td>
                  <td className="px-4 py-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={active}
                        disabled={statusMutation.isPending}
                        onChange={() => handleToggleActive(u)}
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
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="text-teal-600 hover:underline"
                      onClick={() => handleEdit(u)}
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
            {search ? 'No se encontraron usuarios.' : 'No hay usuarios.'}
          </div>
        )}
        {filtered.map((u) => {
          const active = isActiveFromUserEntity(u);
            return (
            <div key={u.id} className="border rounded shadow p-4 bg-white">
              <div className="font-bold text-lg">
                {(u.firstName || u.firstname || '-') + ' ' + (u.lastName || '')}
              </div>
              <div className="text-sm text-gray-700 space-y-1 mt-2">
                <div>
                  <span className="font-medium">Email:</span> {u.email}
                </div>
                <div>
                  <span className="font-medium">Tel:</span> {u.phone || '-'}
                </div>
                <div>
                  <span className="font-medium">Rol:</span> {u.role || '-'}
                </div>
                <div>
                  <span className="font-medium">Estado:</span>{' '}
                  {active ? 'Activo' : 'Inactivo'}
                </div>
                <div>
                  <span className="font-medium">Creado:</span>{' '}
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString()
                    : '-'}
                </div>
              </div>
              <div className="flex gap-4 mt-3 items-center">
                <button
                  className="text-teal-600 hover:underline"
                  onClick={() => handleEdit(u)}
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
                    onChange={() => handleToggleActive(u)}
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
          <div className="bg-white p-6 rounded shadow max-w-lg w-full">
            <UsersForm
              mode={editUser ? 'edit' : 'create'}
              initialValues={editUser || undefined}
              submitting={submitting}
              onSubmit={(data) => {
                if (editUser) {
                  updateMutation.mutate({ id: editUser.id, data });
                } else {
                  createMutation.mutate(data);
                }
              }}
              onCancel={() => {
                setShowForm(false);
                setEditUser(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}