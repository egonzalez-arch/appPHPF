import { API_URL } from './api';

function getCsrf() {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find(r => r.startsWith('csrf_token='))?.split('=')[1] || ''
  );
}

export interface CompanyEntity {
  id: string;
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyInput {
  name: string;
  address: string;
  phone?: string;
  email?: string;
}

export type UpdateCompanyInput = Partial<CreateCompanyInput>;

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

export async function fetchCompanies(search?: string): Promise<CompanyEntity[]> {
  const url = new URL(`${API_URL}/companies`);
  if (search) url.searchParams.set('search', search);
  const res = await fetch(url.toString(), {
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createCompany(data: CreateCompanyInput): Promise<CompanyEntity> {
  const res = await fetch(`${API_URL}/companies`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf() },
    body: JSON.stringify(data),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErr(txt));
  return parseJSON<CompanyEntity>(txt);
}

export async function updateCompany(id: string, data: UpdateCompanyInput): Promise<CompanyEntity> {
  const res = await fetch(`${API_URL}/companies/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': getCsrf() },
    body: JSON.stringify(data),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErr(txt));
  return parseJSON<CompanyEntity>(txt);
}

export async function deleteCompany(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/companies/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
}