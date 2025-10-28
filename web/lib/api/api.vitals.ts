import { API_URL } from './api';

function getCsrf() {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find(r => r.startsWith('csrf_token='))?.split('=')[1] || ''
  );
}

export interface VitalsEntity {
  id: string;
  encounterId: string;
  height: number;
  weight: number;
  bmi: number;
  hr: number;
  bp: string;
  spo2: number;
  recordedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVitalsInput {
  encounterId: string;
  height: number;
  weight: number;
  bmi?: number;
  hr: number;
  bp: string;
  spo2: number;
  recordedAt?: string;
}

export interface UpdateVitalsInput extends Partial<CreateVitalsInput> {}

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

export async function fetchVitals(params?: {
  encounterId?: string;
  patientId?: string;
}): Promise<VitalsEntity[]> {
  const url = new URL(`${API_URL}/vitals`);
  if (params?.encounterId) url.searchParams.set('encounterId', params.encounterId);
  if (params?.patientId) url.searchParams.set('patientId', params.patientId);
  const res = await fetch(url.toString(), {
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchVital(id: string): Promise<VitalsEntity> {
  const res = await fetch(`${API_URL}/vitals/${id}`, {
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createVitals(data: CreateVitalsInput): Promise<VitalsEntity> {
  const res = await fetch(`${API_URL}/vitals`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf() },
    body: JSON.stringify(data),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErr(txt));
  return parseJSON<VitalsEntity>(txt);
}

export async function updateVitals(id: string, data: UpdateVitalsInput): Promise<VitalsEntity> {
  const res = await fetch(`${API_URL}/vitals/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf() },
    body: JSON.stringify(data),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErr(txt));
  return parseJSON<VitalsEntity>(txt);
}

export async function deleteVitals(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/vitals/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
}