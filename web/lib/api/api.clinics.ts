import { API_URL } from './api';

function getCsrf() {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find(r => r.startsWith('csrf_token='))?.split('=')[1] || ''
  );
}

export interface ClinicEntity {
  id: string;
  companyId: string;
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  openingHours?: string | null;
  createdAt?: string;
  updatedAt?: string;
  company?: {
    id: string;
    name: string;
  };
}

export interface CreateClinicInput {
  companyId: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  openingHours?: string;
}

export type UpdateClinicInput = Partial<CreateClinicInput>;

function parseErr(txt: string) {
  try {
    const j = JSON.parse(txt);
    return j.message || txt;
  } catch {
    return txt;
  }
}

function parseJSON<T = any>(txt: string): T {
  try {
    return JSON.parse(txt);
  } catch {
    throw new Error('Respuesta inválida del servidor');
  }
}

export async function fetchClinics(search?: string, companyId?: string): Promise<ClinicEntity[]> {
  const url = new URL(`${API_URL}/clinics`);
  if (search) url.searchParams.set('search', search);
  if (companyId) url.searchParams.set('companyId', companyId);

  const res = await fetch(url.toString(), {
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createClinic(data: CreateClinicInput): Promise<ClinicEntity> {
  const res = await fetch(`${API_URL}/clinics`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf() },
    body: JSON.stringify(data),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErr(txt));
  return parseJSON<ClinicEntity>(txt);
}

export async function updateClinic(id: string, data: UpdateClinicInput): Promise<ClinicEntity> {
  const res = await fetch(`${API_URL}/clinics/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf() },
    body: JSON.stringify(data),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErr(txt));
  return parseJSON<ClinicEntity>(txt);
}

export async function deleteClinic(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/clinics/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
}