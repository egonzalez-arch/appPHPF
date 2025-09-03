'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchUsers } from "@/lib/api/api";

interface User {
  id: number;
  name?: string;
  email?: string;
  disabled?: boolean;
  PasswordHash?: string;
  [key: string]: any;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const loadUsers = () => {
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    fetchUsers(token)
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar usuarios:", err);
        setError("No autorizado o error al cargar usuarios");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Obtiene las claves que mostrar (excluyendo id y password)
  const visibleFields = users.length > 0
    ? Object.keys(users[0]).filter(key => key !== 'id' && key !== 'passwordHash')
    : [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-teal-700">Usuarios</h1>
      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p>No hay usuarios para mostrar.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr>
              {visibleFields.map((field) => (
                <th key={field} className="py-2 px-4 border-b text-left">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                {visibleFields.map((field) => (
                  <td key={field} className="py-2 px-4 border-b">
                    {typeof u[field] === "boolean"
                      ? u[field]
                        ? <span className="text-green-600 font-semibold">Activo</span>
                        : <span className="text-red-600 font-semibold">Deshabilitado</span>
                      : u[field] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}