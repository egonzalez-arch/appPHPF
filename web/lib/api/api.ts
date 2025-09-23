import { QueryClient } from '@tanstack/react-query';

export const client = new QueryClient();

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Tipos compatibles con múltiples backends (manteniendo compatibilidad)
export type StatusString = 'ACTIVE' | 'INACTIVE' | 'active' | 'inactive';

export interface User {
  id: string;
  firstname?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  // Soportar múltiples formatos de estado sin romper llamadas existentes
  status?: StatusString | boolean | 1 | 0 | null;
  phone?: string;
  isActive?: boolean; // algunos backends usan isActive
  createdAt?: string | Date;
  [key: string]: unknown;
}

export interface Patient {
  id: string;
  bloodType?: string;
  age?: number;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  PatientSex?: string;
  phone?: string;
  allergies?: JSON | string | null;
  user?: User | null;
  nombre?: string;
  apellido?: string;
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
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrf_token='))
      ?.split('=')[1] || ''
  );
}

// Utilidades de estado
export function isActiveFromUser(u?: User | null): boolean {
  if (!u) return false;
  const s = u.status;
  if (typeof s === 'string') {
    const v = s.toUpperCase();
    return v === 'ACTIVE';
  }
  if (typeof s === 'number') {
    return s === 1;
  }
  if (typeof s === 'boolean') {
    return s;
  }
  if (typeof u.isActive === 'boolean') {
    return u.isActive;
  }
  return false;
}

export function toStatusString(active: boolean): StatusString {
  return active ? 'ACTIVE' : 'INACTIVE';
}

/**
 * Construye un payload de actualización de estado compatible con backends que usan:
 * - status: 'ACTIVE' | 'INACTIVE'
 * - isActive: boolean
 */
function buildStatusPayload(active: boolean, mode: 'string' | 'boolean') {
  return mode === 'string'
    ? { status: toStatusString(active) }
    : { isActive: active };
}

async function parseOrText(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text || 'Error';
  }
}

/**
 * Actualiza estado de usuario de forma robusta probando ambos formatos.
 * - Primero intenta PATCH /users/:id { status: 'ACTIVE' | 'INACTIVE' }
 * - Si falla (400/422), intenta { isActive: boolean }
 */
// Deshabilitar usuario usando cookies + CSRF (misma lógica que fetchPatients)
export async function disableUser(id: string): Promise<User> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/users/${id}/disable`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  });
  const data = await parseOrText(res);
  if (!res.ok) {
    throw new Error(
      typeof data === 'string' ? data : data?.message || 'Error al deshabilitar usuario'
    );
  }
  return data as User;
}

// Habilitar usuario (poner ACTIVE) usando cookies + CSRF
export async function enableUser(id: string): Promise<User> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify({ status: 'ACTIVE' }),
  });
  const data = await parseOrText(res);
  if (!res.ok) {
    throw new Error(
      typeof data === 'string' ? data : data?.message || 'Error al habilitar usuario'
    );
  }
  return data as User;
}

// Toggle helper: según el "activo" deseado, llama a enableUser o disableUser
export async function changeUserActive(userId: string, active: boolean): Promise<User> {
  if (active) {
    return enableUser(userId);
  }
  return disableUser(userId);
}
/**
 * Opción existente (cookies) — la dejamos por compatibilidad si hay otros lugares que la usan.
 * Si el backend de GET /patients requiere Bearer, usa fetchPatientsWithSession() o fetchPatientsWithToken()
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
    const msg = await res.text().catch(() => '');
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
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  });
  if (!res.ok) return { user: null };
  const data = await res.json();
  return { user: data.user || null, accessToken: data.accessToken };
}


export async function createPatient(data: Omit<Patient, 'id'>): Promise<Patient> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/patients`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deletePatient(id: string): Promise<void> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'X-CSRF-Token': csrfToken,
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

// Doctor Functions
export async function fetchDoctors(): Promise<Doctor[]> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/doctors`, {
    credentials: 'include',
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  });
  if (!res.ok) throw new Error('No autorizado');
  return res.json();
}

export async function createDoctor(data: Omit<Doctor, 'id'>): Promise<Doctor> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/doctors`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateDoctor(id: string, data: Partial<Doctor>): Promise<Doctor> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/doctors/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteDoctor(id: string): Promise<void> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/doctors/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'X-CSRF-Token': csrfToken,
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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Credenciales incorrectas');
  }
  const data = await res.json();
  if (!data.user) {
    throw new Error('Credenciales incorrectas');
  }
  return data.user;
}

// Logout
export async function logout(): Promise<void> {
  const csrfToken = getCsrfTokenFromCookie();
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  });
}

// Validar sesión (se mantiene para compatibilidad en el resto del código)
export async function validateSession(): Promise<any> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/auth/validate-session`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRF-Token': csrfToken,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user || null;
}