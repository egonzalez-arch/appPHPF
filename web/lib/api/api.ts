import { QueryClient } from '@tanstack/react-query';
export const client = new QueryClient();

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Interfaces recomendadas
export interface Patient {
  id: string;
  name: string;
  email: string;
  age?: number;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  sex?: string;
  document?: string;
  phone?: string;
  address?: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  status?: string;
  disabled?: boolean;
  [key: string]: unknown;
}

export interface Doctor {
  id: string;
  specialty: string;
  license: string;
  bio: string;
  name?: string;
  [key: string]: unknown;
}

// Patients
export async function fetchPatients(): Promise<Patient[]> {
  const res = await fetch(`${API_URL}/patients`, { credentials: "include" });
  if (!res.ok) throw new Error("No autorizado");
  return res.json();
}

export async function createPatient(data: Omit<Patient, "id">): Promise<Patient> {
  const res = await fetch(`${API_URL}/patients`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deletePatient(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Users
export async function fetchUsers(token: string): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error("Error al obtener usuarios");
  return JSON.parse(text);
}

export async function addUser(token: string, data: Omit<User, "id">): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
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

export async function updateUser(token: string, id: string, data: Partial<User>): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar usuario");
  return res.json();
}

export async function disableUser(token: string, id: string): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}/disable`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al deshabilitar usuario");
  return res.json();
}

// Doctor Functions
export async function fetchDoctors(): Promise<Doctor[]> {
  const res = await fetch(`${API_URL}/doctors`, { credentials: "include" });
  if (!res.ok) throw new Error("No autorizado");
  return res.json();
}

export async function createDoctor(data: Omit<Doctor, "id">): Promise<Doctor> {
  const res = await fetch(`${API_URL}/doctors`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor> {
  const res = await fetch(`${API_URL}/doctors/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteDoctor(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/doctors/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Login function for auth
export async function login(email: string, password: string): Promise<{ accessToken: string; user: User }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Validate session function for auth
export async function validateSession(token: string): Promise<User | null> {
  const res = await fetch(`${API_URL}/auth/validate-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data && data.user && Object.keys(data.user).length > 0) {
    return data.user as User;
  }
  return null;
}