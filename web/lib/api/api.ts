import { QueryClient } from '@tanstack/react-query';
import { buildPatientUpdatePayload } from './patientPayload';

export const client = new QueryClient();

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type StatusString = 'ACTIVE' | 'INACTIVE' | 'active' | 'inactive';

export interface User {
  id: string;
  firstname?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  status?: StatusString | boolean | 1 | 0 | null;
  phone?: string;
  isActive?: boolean;
  createdAt?: string | Date;
  [key: string]: unknown;
}

export interface EmergencyContact {
  name?: string;
  relation?: string;
  phone?: string;
  [k: string]: any;
}

function mapEmergencyContact(ecRaw: any): EmergencyContact | null {
  if (!ecRaw || typeof ecRaw !== 'object' || Array.isArray(ecRaw)) return null;

  // Normalización de posibles variantes en español / diferentes estilos
  const name =
    ecRaw.name ??
    ecRaw.Name ??
    ecRaw.nombre ??
    ecRaw.Nombre ??
    ecRaw.fullName ??
    ecRaw.contactName;

  const relation =
    ecRaw.relation ??
    ecRaw.Relation ??
    ecRaw.relacion ??
    ecRaw.Relación ??
    ecRaw.relationship ??
    ecRaw.parentesco;

  const phone =
    ecRaw.phone ??
    ecRaw.telefono ??
    ecRaw.tel ??
    ecRaw.Telefono ??
    ecRaw.mobile ??
    ecRaw.celular ??
    ecRaw.cel;

  // Si no encontró las claves típicas pero sí hay otras, igual devolvemos algo
  if (!name && !relation && !phone) {
    // Devuelve el objeto original para que el frontend pueda mostrarlo serializado
    return {
      // lo dejamos “raw” para fallback
      // puedes añadir un campo _raw si quieres
      ...ecRaw,
    };
  }

  return { name, relation, phone, ...ecRaw };
}

export function normalizePatient(p: any): Patient {
  const ecParsed = safeParseJSON<any>(p.emergencyContact);
  const ec = mapEmergencyContact(ecParsed);

  return {
    ...p,
    emergencyContact: ec,
    allergies: normalizeAllergies(p.allergies),
    birthDate: normalizeBirthDate(p.birthDate),
  };
}

export interface Patient {
  id: string;
  bloodType?: string;
  age?: number;
  firstName?: string;
  lastName?: string;
  birthDate?: string;            // normalizado a YYYY-MM-DD
  PatientSex?: string;
  phone?: string;
  emergencyContact?: EmergencyContact | null;
  allergies?: string[] | null;   // normalizamos a array de strings o null
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

function getCsrfTokenFromCookie(): string {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrf_token='))
      ?.split('=')[1] || ''
  );
}

export function isActiveFromUser(u?: User | null): boolean {
  if (!u) return false;
  const s = u.status;
  if (typeof s === 'string') return s.toUpperCase() === 'ACTIVE';
  if (typeof s === 'number') return s === 1;
  if (typeof s === 'boolean') return s;
  if (typeof u.isActive === 'boolean') return u.isActive;
  return false;
}

export function toStatusString(active: boolean): StatusString {
  return active ? 'ACTIVE' : 'INACTIVE';
}

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

/* ---------------- Normalización de Patient ---------------- */

function safeParseJSON<T = any>(value: unknown): T | null {
  if (value == null) return null;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      return null;
    }
  }
  return null;
}

function normalizeAllergies(raw: any): string[] | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    const parsed = safeParseJSON<any>(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
    // fallback: dividir por coma
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return null;
}

function normalizeBirthDate(birthDate: any): string | undefined {
  if (!birthDate) return undefined;
  if (typeof birthDate === 'string') {
    // Si ya está en formato YYYY-MM-DD o ISO, recortar
    if (birthDate.length >= 10) return birthDate.substring(0, 10);
    return birthDate;
  }
  if (birthDate instanceof Date) {
    return birthDate.toISOString().substring(0, 10);
  }
  return undefined;
}



function normalizePatients(list: any[]): Patient[] {
  return list.map(normalizePatient);
}

/* ---------------- User status helpers (cookies + CSRF) ---------------- */

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

export async function changeUserActive(userId: string, active: boolean): Promise<User> {
  return active ? enableUser(userId) : disableUser(userId);
}

/* ---------------- Patients ---------------- */

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
  const data = await res.json();
  return Array.isArray(data) ? normalizePatients(data) : [];
}

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
  const created = await res.json();
  return normalizePatient(created);
}

export async function updatePatient(id: string, data: any): Promise<Patient> {
  const csrfToken = getCsrfTokenFromCookie();
  const sanitized = buildPatientUpdatePayload(data);
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(sanitized),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt);
  }
  const updated = await res.json();
  return normalizePatient(updated);
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
    await res.json();
  } catch {
    // ignorar
  }
}

/* ---------------- Doctors ---------------- */

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
    // ignorar
  }
}

/* ---------------- Auth ---------------- */

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
  if (!data.user) throw new Error('Credenciales incorrectas');
  return data.user;
}

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