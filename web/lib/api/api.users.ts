import { API_URL } from './api';

function getCsrfTokenFromCookie(): string {
  if (typeof document === 'undefined') return '';
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrf_token='))
      ?.split('=')[1] || ''
  );
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
}

export async function createUser(data: CreateUserInput) {
  const csrfToken = getCsrfTokenFromCookie();
  if (process.env.NODE_ENV !== 'production') {
    console.log('[createUser] body:', data);
  }
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'Error al crear usuario');
  }
  return res.json();
}