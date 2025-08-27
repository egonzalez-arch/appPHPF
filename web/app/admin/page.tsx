'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, QueryClientProvider } from '@tanstack/react-query';
import { client } from '@/lib/api';
import { UserRole } from '@/lib/types';

function fetchUsers() {
  return fetch('/api/users', { credentials: 'include' }).then(res => res.json());
}

function updateUserRole(id: string, role: UserRole) {
  return fetch(`/api/users/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  }).then(res => res.json());
}

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const { data: users, refetch } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  const mutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => updateUserRole(id, role),
    onSuccess: () => refetch()
  });

  if (!session || session.user.role !== 'ADMIN') {
    router.push('/dashboard');
    return null;
  }

  return (
    <QueryClientProvider client={client}>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <table className="w-full border">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(u => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={e => mutation.mutate({ id: u.id, role: e.target.value as UserRole })}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="PATIENT">PATIENT</option>
                    <option value="INSURER">INSURER</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </QueryClientProvider>
  );
}