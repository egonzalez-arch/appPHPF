import { API_URL } from './api';

function getCsrf() {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find((r) => r.startsWith('csrf_token='))?.split('=')[1] || ''
  );
}

/* ================= Tipos alineados con backend ================= */

export interface DoctorUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface DoctorCorePayload {
  specialty: string;
  license: string;
  bio?: string;
}

export interface CreateDoctorWithUserInput {
  user: DoctorUserPayload;
  doctor: DoctorCorePayload;
}

export interface CreateDoctorOnlyInput {
  userId: string;
  specialty: string;
  license: string;
  bio?: string;
}

export interface DoctorUserEmbedded {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  status?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorEntity {
  id: string;
  specialty: string;
  license: string;
  bio?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: DoctorUserEmbedded;
}

/* ================= Helpers parsing ================= */

function parseErrorMessage(txt: string) {
  try {
    const j = JSON.parse(txt);
    return j.message || txt;
  } catch {
    return txt || 'Error';
  }
}
function parseJSONSafe<T = any>(txt: string): T {
  try {
    return JSON.parse(txt);
  } catch {
    throw new Error('Respuesta inválida del servidor');
  }
}

/* ================= API Calls ================= */

export async function fetchDoctors(): Promise<DoctorEntity[]> {
  const res = await fetch(`${API_URL}/doctors`, {
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createDoctorWithUser(
  data: CreateDoctorWithUserInput,
): Promise<DoctorEntity> {
  // Validación mínima antes de enviar
  if (!data?.user || !data?.doctor) {
    throw new Error('Payload inválido: falta user o doctor');
  }
  const res = await fetch(`${API_URL}/doctors/with-user`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrf(),
    },
    body: JSON.stringify(data),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErrorMessage(txt));
  return parseJSONSafe<DoctorEntity>(txt);
}

export async function createDoctorOnly(
  data: CreateDoctorOnlyInput,
): Promise<DoctorEntity> {
  if (!data.userId) throw new Error('userId es requerido');
  const res = await fetch(`${API_URL}/doctors`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrf(),
    },
    body: JSON.stringify(data),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErrorMessage(txt));
  return parseJSONSafe<DoctorEntity>(txt);
}

export interface UpdateDoctorInput {
  specialty?: string;
  license?: string;
  bio?: string;
}

export async function updateDoctor(
  id: string,
  data: UpdateDoctorInput,
): Promise<DoctorEntity> {
  const res = await fetch(`${API_URL}/doctors/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrf(),
    },
    body: JSON.stringify(data),
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErrorMessage(txt));
  return parseJSONSafe<DoctorEntity>(txt);
}

export async function disableDoctor(id: string): Promise<DoctorEntity> {
  const res = await fetch(`${API_URL}/doctors/${id}/disable`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErrorMessage(txt));
  return parseJSONSafe<DoctorEntity>(txt);
}

export async function enableDoctor(id: string): Promise<DoctorEntity> {
  const res = await fetch(`${API_URL}/doctors/${id}/enable`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRF-Token': getCsrf() },
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(parseErrorMessage(txt));
  return parseJSONSafe<DoctorEntity>(txt);
}

export async function toggleDoctorActive(
  doc: DoctorEntity,
): Promise<DoctorEntity> {
  const active =
    doc?.user?.status &&
    typeof doc.user.status === 'string' &&
    doc.user.status.toUpperCase() === 'ACTIVE';
  return active ? disableDoctor(doc.id) : enableDoctor(doc.id);
}

/* ================= Filtro client-side ================= */

export function filterDoctorsClient(
  list: DoctorEntity[] | undefined,
  term: string,
) {
  if (!list) return [];
  const t = term.trim().toLowerCase();
  if (!t) return list;
  return list.filter((d) =>
    [
      d.specialty,
      d.license,
      d.bio,
      d.user?.firstName,
      d.user?.lastName,
      d.user?.email,
      d.user?.phone,
    ]
      .filter(Boolean)
      .some((f) => (f as string).toLowerCase().includes(t)),
  );
}