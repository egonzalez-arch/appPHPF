import { QueryClient } from '@tanstack/react-query';
export const client = new QueryClient();

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchPatients() {
  const res = await fetch(`${API_URL}/patients`, { credentials: "include" });
  if (!res.ok) throw new Error("No autorizado");
  return res.json();
}

export async function createPatient(data: any) {
  const res = await fetch(`${API_URL}/patients`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updatePatient(id: string, data: any) {
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deletePatient(id: string) {
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchUsers(token: string) {
  const res = await fetch("/api/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("Status:", res.status);
const text = await res.text();
console.log("Response:", text);

if (!res.ok) throw new Error("Error al obtener usuarios");
return JSON.parse(text);


  if (!res.ok) throw new Error("Error al obtener usuarios");
  return JSON.parse(text);
}

export async function addUser(token: string, data: { name: string; email: string }) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al agregar usuario");
  return res.json();
}

export async function updateUser(token: string, id: number, data: { name: string; email: string }) {
  const res = await fetch(`/api/users/${id}`, {
    method: "PUT", // o "PATCH" según tu API
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar usuario");
  return res.json();
}

export async function disableUser(token: string, id: number) {
  const res = await fetch(`/api/users/${id}/disable`, {
    method: "POST", // o "PATCH", según tu API
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al deshabilitar usuario");
  return res.json();
}