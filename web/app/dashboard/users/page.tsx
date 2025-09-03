'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchUsers } from "@/lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUsers(token)
      .then(setUsers)
      .catch(() => setError("No autorizado o error al cargar usuarios"));
  }, [router]);

  return (
    <div>
      <h1>Usuarios</h1>
      {error && <p style={{color: "red"}}>{error}</p>}
      <ul>
        {users.map((u: any) => (
          <li key={u.id}>{u.email}</li>
        ))}
      </ul>
    </div>
  );
}