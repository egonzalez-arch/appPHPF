import { QueryClient } from '@tanstack/react-query';
export const client = new QueryClient();

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Interfaces recomendadas
export interface Patient {
  id: string;
  bloodType: string;
  age?: number;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  PatientSex?: string;
  phone?: string;
  allergies?: JSON;
  [key: string]: unknown;
}

export interface User {
  id: string;
  firstname: string;
  email: string;
  role?: string;
  status?: string;
  phone?: string;
  status?: boolean;
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

// Helper para leer el CSRF token de la cookie
function getCsrfTokenFromCookie(): string {
  if (typeof document === "undefined") return "";
  return (
    document.cookie
      .split("; ")
      .find(row => row.startsWith("csrf_token="))
      ?.split("=")[1] || ""
  );
}

/**
 * Opción existente (cookies) — la dejamos por compatibilidad si hay otros lugares que la usan.
 * Si el backend de GET /patients requiere Bearer, usa fetchPatientsWithSession() de abajo.
 */
export async function fetchPatients(): Promise<Patient[]> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/patients`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || 'No autorizado');
  }
  return res.json();
}

/**
 * NUEVO: obtiene sesión (user + accessToken) usando cookies.
 * Requiere que el backend devuelva accessToken en /auth/validate-session.
 */
export async function getSession(): Promise<{ user: any | null; accessToken?: string }> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/auth/validate-session`, {
    method: "POST",
    credentials: "include",
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  });
  if (!res.ok) return { user: null };
  const data = await res.json();
  return { user: data.user || null, accessToken: data.accessToken };
}

/**
 * NUEVO: versión con Bearer para GET /patients
 */
export async function fetchPatientsWithToken(token: string): Promise<Patient[]> {
  const res = await fetch(`${API_URL}/patients`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || 'No autorizado');
  }
  return res.json();
}

/**
 * NUEVO: flujo completo usando la misma lógica de sesión (cookies) para obtener el accessToken
 * y luego llamando a /patients con Authorization: Bearer.
 */
export async function fetchPatientsWithSession(): Promise<Patient[]> {
  const { accessToken } = await getSession();
  if (!accessToken) {
    throw new Error('No autorizado');
  }
  return fetchPatientsWithToken(accessToken);
}

export async function createPatient(data: Omit<Patient, "id">): Promise<Patient> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/patients`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deletePatient(id: string): Promise<void> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return;
  try {
    await res.json(); // si hay cuerpo, consúmelo
  } catch {
    // ignora si no hay JSON
  }
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
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/doctors`, {
    credentials: "include",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
  });
  if (!res.ok) throw new Error("No autorizado");
  return res.json();
}

export async function createDoctor(data: Omit<Doctor, "id">): Promise<Doctor> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/doctors`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/doctors/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteDoctor(id: string): Promise<void> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/doctors/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return;
  try {
    await res.json();
  } catch {
    // ignora si no hay JSON
  }
}

// Login (sin cambios, para no impactar el flujo actual)
export async function login(email: string, password: string): Promise<any> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Credenciales incorrectas");
  }
  const data = await res.json();
  if (!data.user) {
    throw new Error("Credenciales incorrectas");
  }
  return data.user;
}

// Logout
export async function logout(): Promise<void> {
  const csrfToken = getCsrfTokenFromCookie();
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
  });
}

// Validar sesión (se mantiene para compatibilidad en el resto del código)
export async function validateSession(): Promise<any> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/auth/validate-session`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user || null;
}