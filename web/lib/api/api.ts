import { QueryClient } from '@tanstack/react-query';
import { buildPatientUpdatePayload } from './patientPayload';
import { sanitizePatientPayload } from './sanitizePatient';
import { CreatePatientRequest } from './patient.types';

/* NUEVO: import opcional para re-exportar usuarios */
import { fetchUsers as internalFetchUsers } from './api.users';

export const client = new QueryClient();
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type StatusString = 'ACTIVE' | 'INACTIVE' | 'active' | 'inactive';

/* ====================== Tipos base ====================== */
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

export interface Patient {
  id: string;
  bloodType?: string;
  age?: number;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  PatientSex?: string;
  phone?: string;
  emergencyContact?: EmergencyContact | null;
  allergies?: string[] | null;
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

/* ============= Helpers genéricos / CSRF ============= */
function getCsrfTokenFromCookie(): string {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrf_token='))?.split('=')[1] || ''
  );
}

async function parseOrText(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text || 'Error';
  }
}

/* ============= Estado usuario (compat) ============= */
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

/* ============= Normalización Patient ============= */
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
    if (birthDate.length >= 10) return birthDate.substring(0, 10);
    return birthDate;
  }
  if (birthDate instanceof Date) {
    return birthDate.toISOString().substring(0, 10);
  }
  return undefined;
}

function mapEmergencyContact(ecRaw: any): EmergencyContact | null {
  if (!ecRaw || typeof ecRaw !== 'object' || Array.isArray(ecRaw)) return null;
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

  if (!name && !relation && !phone) return { ...ecRaw };
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

function normalizePatients(list: any[]): Patient[] {
  return list.map(normalizePatient);
}

/* ============= User status endpoints (compat) ============= */
export async function disableUser(id: string): Promise<User> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/users/${id}/disable`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRF-Token': csrfToken },
  });
  const data = await parseOrText(res);
  if (!res.ok) {
    throw new Error(
      typeof data === 'string' ? data : data?.message || 'Error al deshabilitar usuario',
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
      typeof data === 'string' ? data : data?.message || 'Error al habilitar usuario',
    );
  }
  return data as User;
}

export async function changeUserActive(userId: string, active: boolean): Promise<User> {
  return active ? enableUser(userId) : disableUser(userId);
}

/* ============= Patients ============= */
export async function fetchPatients(): Promise<Patient[]> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/patients`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'X-CSRF-Token': csrfToken },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || 'No autorizado');
  }
  const data = await res.json();
  return Array.isArray(data) ? normalizePatients(data) : [];
}

/* COMPAT: wrapper para código existente que esperaba fetchPatientsWithSession */
export async function fetchPatientsWithSession(): Promise<Patient[]> {
  return fetchPatients();
}

export async function createPatient(data: CreatePatientRequest): Promise<Patient> {
  const csrfToken = getCsrfTokenFromCookie();
  const sanitized = sanitizePatientPayload(data);
  if (process.env.NODE_ENV !== 'production') {
    console.log('[api] createPatient sanitized payload:', sanitized);
  }
  const res = await fetch(`${API_URL}/patients`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(sanitized),
  });
  const txt = await res.text();
  if (!res.ok) {
    let parsed: any = txt;
    try { parsed = JSON.parse(txt); } catch {}
    throw new Error(
      typeof parsed === 'string' ? parsed : parsed?.message || 'Error al crear paciente',
    );
  }
  let created: any;
  try { created = JSON.parse(txt); } catch {
    throw new Error('Respuesta inválida (crear paciente)');
  }
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
  const txt = await res.text();
  if (!res.ok) {
    throw new Error(txt || 'Error al actualizar paciente');
  }
  let updated: any;
  try { updated = JSON.parse(txt); } catch {
    throw new Error('Respuesta inválida (actualizar paciente)');
  }
  return normalizePatient(updated);
}

export async function deletePatient(id: string): Promise<void> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/patients/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-CSRF-Token': csrfToken },
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return;
  try {
    await res.json();
  } catch { /* ignore */ }
}

/* ============= Doctors ============= */
export async function fetchDoctors(): Promise<Doctor[]> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/doctors`, {
    credentials: 'include',
    headers: { 'X-CSRF-Token': csrfToken },
  });
  if (!res.ok) throw new Error('No autorizado');
  return res.json();
}

export async function createDoctor(data: Omit<Doctor, 'id'>): Promise<Doctor> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/doctors`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
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
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
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
    headers: { 'X-CSRF-Token': csrfToken },
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return;
  try {
    await res.json();
  } catch { /* ignore */ }
}

/* ============= Auth ============= */
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
  // Construir base de API de forma robusta: usar NEXT_PUBLIC_API_URL si está definida,
  // o fallback a ruta relativa (útil en entorno donde Next actúa como proxy).
  const base =
    typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
      ? (process.env.NEXT_PUBLIC_API_URL as string).replace(/\/$/, '')
      : '';

  // Si base está vacío, usamos la ruta relativa que apunta al proxy/Next API route.
  const url = base ? `${base}/auth/logout` : '/api/auth/logout';

  try {
    const csrfToken = getCsrfTokenFromCookie(); // si tu proyecto usa esto
    const headers: Record<string, string> = {};
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers,
    });

    // Opcional: manejar respuestas no OK
    if (!res.ok) {
      // Si quieres más información en dev
      if (process.env.NODE_ENV !== 'production') {
        const text = await res.text().catch(() => '');
        // eslint-disable-next-line no-console
        console.warn('Logout failed', res.status, text);
      }
      // No lanzar para evitar romper la navegación/UX; pero puedes lanzar si prefieres
    }
  } catch (err) {
    // En desarrollo loguear el error para diagnóstico
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Network error during logout:', err);
    }
    // No rethrow: mantenemos experiencia de usuario estable
  }
}

export async function validateSession(): Promise<any> {
  const csrfToken = getCsrfTokenFromCookie();
  const res = await fetch(`${API_URL}/auth/validate-session`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRF-Token': csrfToken },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user || null;
}

/* ============= Re-export usuarios (compat) ============= */
export const fetchUsers = internalFetchUsers;