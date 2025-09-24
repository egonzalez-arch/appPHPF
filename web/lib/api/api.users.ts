import { API_URL } from './api';

/* =========================================================
   Utilidades internas
========================================================= */
function getCsrfTokenFromCookie(): string {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrf_token='))?.split('=')[1] || ''
  );
}

async function parseJSONSafe(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text || null;
  }
}

function buildHeaders(json = true) {
  const csrf = getCsrfTokenFromCookie();
  const h: Record<string, string> = { 'X-CSRF-Token': csrf };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

/* =========================================================
   Tipos
========================================================= */
export type UserStatusLoose =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'active'
  | 'inactive'
  | boolean
  | 1
  | 0
  | null
  | undefined;

export interface UserEntity {
  id: string;
  firstName?: string;
  firstname?: string;
  lastName?: string;
  email: string;
  role?: string;
  phone?: string;
  status?: UserStatusLoose;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  password?: string;
}

/* =========================================================
   Normalización y helpers
========================================================= */
export function normalizeUser(u: any): UserEntity {
  if (!u || typeof u !== 'object') return u;
  return {
    ...u,
    firstName: u.firstName ?? u.firstname,
  };
}

export function isActiveFromUserEntity(u?: UserEntity | null): boolean {
  if (!u) return false;
  const s = u.status;
  if (typeof s === 'string') return s.toUpperCase() === 'ACTIVE';
  if (typeof s === 'number') return s === 1;
  if (typeof s === 'boolean') return s;
  if (typeof u.isActive === 'boolean') return u.isActive;
  return false;
}

/* =========================================================
   Fetch listado
========================================================= */
export async function fetchUsers(): Promise<UserEntity[]> {
  const res = await fetch(`${API_URL}/users`, {
    method: 'GET',
    credentials: 'include',
    headers: buildHeaders(false),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || 'Error al obtener usuarios');
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeUser) : [];
}

/* =========================================================
   Crear usuario
========================================================= */
export async function createUser(data: CreateUserInput): Promise<UserEntity> {
  const body = {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || undefined,
    password: data.password,
    role: data.role || 'PATIENT',
  };

  if (process.env.NODE_ENV !== 'production') {
    console.log('[api.users] createUser payload:', body);
  }

  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    credentials: 'include',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });

  const parsed = await parseJSONSafe(res);
  if (!res.ok) {
    const msg =
      typeof parsed === 'string'
        ? parsed
        : parsed?.message || 'Error al crear usuario';
    throw new Error(msg);
  }
  return normalizeUser(parsed);
}

/* =========================================================
   Actualizar usuario
========================================================= */
export async function updateUser(
  id: string,
  data: UpdateUserInput,
): Promise<UserEntity> {
  const body: Record<string, any> = {};
  if (data.firstName !== undefined) body.firstName = data.firstName.trim();
  if (data.lastName !== undefined) body.lastName = data.lastName.trim();
  if (data.phone !== undefined) body.phone = data.phone?.trim() || null;
  if (data.role !== undefined) body.role = data.role;
  if (data.password) body.password = data.password;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[api.users] updateUser payload:', { id, body });
  }

  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });

  const parsed = await parseJSONSafe(res);
  if (!res.ok) {
    const msg =
      typeof parsed === 'string'
        ? parsed
        : parsed?.message || 'Error al actualizar usuario';
    throw new Error(msg);
  }
  return normalizeUser(parsed);
}

/* =========================================================
   Cambiar estado (status o isActive)
========================================================= */
export async function updateUserStatus(
  id: string,
  active: boolean,
  mode: 'status' | 'isActive' = 'status',
): Promise<UserEntity> {
  const body =
    mode === 'status'
      ? { status: active ? 'ACTIVE' : 'INACTIVE' }
      : { isActive: active };

  if (process.env.NODE_ENV !== 'production') {
    console.log('[api.users] updateUserStatus payload:', { id, body });
  }

  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });

  const parsed = await parseJSONSafe(res);
  if (!res.ok) {
    const msg =
      typeof parsed === 'string'
        ? parsed
        : parsed?.message || 'Error al cambiar estado de usuario';
    throw new Error(msg);
  }

  return normalizeUser(parsed);
}

/* =========================================================
   Búsqueda client-side de conveniencia
========================================================= */
export function filterUsersClientSide(
  list: UserEntity[] | undefined,
  term: string,
): UserEntity[] {
  if (!list) return [];
  const t = term.trim().toLowerCase();
  if (!t) return list;
  return list.filter((u) =>
    [
      u.firstName,
      u.firstname,
      u.lastName,
      u.email,
      u.phone,
      u.role,
      u.status?.toString(),
    ]
      .filter(Boolean)
      .some((field) => (field as string).toLowerCase().includes(t)),
  );
}