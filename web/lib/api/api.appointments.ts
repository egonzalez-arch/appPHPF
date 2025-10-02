import { API_URL } from './api';

function getCsrf() {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find(r => r.startsWith('csrf_token='))?.split('=')[1] || ''
  );
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface AppointmentEntity {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  startAt: string;   // ISO
  endAt: string;     // ISO
  status: AppointmentStatus;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
  // Si el backend en futuro incluye relaciones pobladas, se pueden añadir:
  // clinic?: { id: string; name: string };
  // doctor?: { id: string; user?: { firstName?: string; lastName?: string } };
  // patient?: { id: string; user?: { firstName?: string; lastName?: string } };
}

export interface CreateAppointmentInput {
  clinicId: string;
  patientId: string;
  doctorId: string;
  startAt: string;
  endAt: string;
  reason: string;
}

export interface UpdateAppointmentInput {
  clinicId?: string;
  patientId?: string;
  doctorId?: string;
  startAt?: string;
  endAt?: string;
  reason?: string;
}

export interface UpdateAppointmentStatusInput {
  status: AppointmentStatus;
}

function parseErr(txt: string) {
  try {
    const j = JSON.parse(txt);
    return j.message || txt;
  } catch {
    return txt;
  }
}

function parseJSON<T=any>(txt: string): T {
  try {
    return JSON.parse(txt);
  } catch {
    throw new Error('Respuesta inválida del servidor');
  }
}

export async function fetchAppointments(params?: {
  doctorId?: string;
  patientId?: string;
  clinicId?: string;
  status?: AppointmentStatus;
}): Promise<AppointmentEntity[]> {
  const url = new URL(`${API_URL}/appointments`);
  if (params?.doctorId) url.searchParams.set('doctorId', params.doctorId);
  if (params?.patientId) url.searchParams.set('patientId', params.patientId);
  if (params?.clinicId) url.searchParams.set('clinicId', params.clinicId);
  if (params?.status) url.searchParams.set('status', params.status);
  const res = await fetch(url.toString(), {
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createAppointment(data: CreateAppointmentInput): Promise<AppointmentEntity> {
  const res = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf() },
    body: JSON.stringify(data),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErr(txt));
  return parseJSON<AppointmentEntity>(txt);
}

export async function updateAppointment(id: string, data: UpdateAppointmentInput): Promise<AppointmentEntity> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf() },
    body: JSON.stringify(data),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErr(txt));
  return parseJSON<AppointmentEntity>(txt);
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<AppointmentEntity> {
  const res = await fetch(`${API_URL}/appointments/${id}/status`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf() },
    body: JSON.stringify({ status }),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErr(txt));
  return parseJSON<AppointmentEntity>(txt);
}

export async function deleteAppointment(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/appointments/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
}