import { QueryClient } from '@tanstack/react-query';
export const client = new QueryClient();

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// GET: lista de pacientes
export async function fetchPatients() {
  const res = await fetch(`${API_URL}/patients`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text() || "No autorizado");
  return res.json();
}

// POST: crear paciente
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

// PATCH: actualizar paciente
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

// DELETE: eliminar paciente
export async function deletePatient(id: string) {
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}