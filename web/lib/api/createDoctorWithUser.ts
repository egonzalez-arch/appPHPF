import { Doctor } from './api';

export interface NewDoctorCompositeInput {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  };
  doctor: {
    specialty: string;
    license: string;
    bio?: string;
  };
}

/**
 * Crea doctor+usuario usando el endpoint compuesto /doctors/with-user
 */
export async function createDoctorWithUser(input: NewDoctorCompositeInput): Promise<Doctor> {
  const csrfToken =
    typeof document !== 'undefined'
      ? (document.cookie
          .split('; ')
          .find((row) => row.startsWith('csrf_token='))?.split('=')[1] || '')
      : '';

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/doctors/with-user`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(input),
    },
  );

  const txt = await res.text();
  let parsed: any = txt;
  try { parsed = JSON.parse(txt); } catch {}
  if (!res.ok) {
    throw new Error(parsed?.message || txt || 'Error al crear doctor+usuario');
  }
  return parsed;
}