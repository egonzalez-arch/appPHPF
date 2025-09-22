/**
 * Cliente mínimo para consumir la API existente.
 * No cambia rutas ni endpoints.
 */
interface RequestOptions extends RequestInit {
  token?: string | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    // Se mantiene genérico para no alterar flujos actuales.
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}

export async function fetchCurrentUser(token: string) {
  return apiFetch('/auth/me', { token });
}