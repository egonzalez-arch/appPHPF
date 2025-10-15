import { API_URL } from './api';

function getCsrf() {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find(r => r.startsWith('csrf_token='))?.split('=')[1] || ''
  );
}

export type EncounterStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface EncounterEntity {
  id: string;
  appointmentId: string;
  encounterDate?: string;
  encounterType?: string;
  reason?: string;
  diagnosis?: string;
  notes?: string;
  status: EncounterStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEncounterInput {
  appointmentId: string;
  encounterDate?: string;
  encounterType?: string;
  reason?: string;
  diagnosis?: string;
  notes?: string;
  status?: EncounterStatus;
  createdBy?: string;
}

export interface UpdateEncounterInput extends Partial<CreateEncounterInput> {}

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

export async function fetchEncounters(params?: {
  appointmentId?: string;
  status?: EncounterStatus;
  createdBy?: string;
}): Promise<EncounterEntity[]> {
  const url = new URL(`${API_URL}/encounters`);
  if (params?.appointmentId) url.searchParams.set('appointmentId', params.appointmentId);
  if (params?.status) url.searchParams.set('status', params.status);
  if (params?.createdBy) url.searchParams.set('createdBy', params.createdBy);
  const res = await fetch(url.toString(), {
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErr(txt));
  return parseJSON<EncounterEntity[]>(txt);
}

export async function fetchEncounter(id: string): Promise<EncounterEntity> {
  const res = await fetch(`${API_URL}/encounters/${id}`, {
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErr(txt));
  return parseJSON<EncounterEntity>(txt);
}

export async function createEncounter(data: CreateEncounterInput): Promise<EncounterEntity> {
  const res = await fetch(`${API_URL}/encounters`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf() },
    body: JSON.stringify(data),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErr(txt));
  return parseJSON<EncounterEntity>(txt);
}

export async function updateEncounter(id: string, data: UpdateEncounterInput): Promise<EncounterEntity> {
  const res = await fetch(`${API_URL}/encounters/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf() },
    body: JSON.stringify(data),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErr(txt));
  return parseJSON<EncounterEntity>(txt);
}

export async function deleteEncounter(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/encounters/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
}