import { createUser, CreateUserInput } from './api.users';
import { Doctor } from './api';

export interface NewDoctorCompositeInput {
  user: CreateUserInput;
  doctor: {
    specialty: string;
    license: string;
    bio?: string;
  };
}

/**
 * Primero crea el usuario, luego crea el doctor asociado (similar a createPatientWithUser).
 * Retorna el doctor con el usuario embebido.
 */
export async function createDoctorWithUser(input: NewDoctorCompositeInput): Promise<Doctor> {
  // 1. Crear usuario
  const userCreated = await createUser({
    ...input.user,
    role: input.user.role || 'DOCTOR',
  });

  // 2. Crear doctor con el userId recién creado
  const csrfToken =
    typeof document !== 'undefined'
      ? (document.cookie
          .split('; ')
          .find((row) => row.startsWith('csrf_token='))?.split('=')[1] || '')
      : '';

  const payload = {
    userId: userCreated.id,
    specialty: input.doctor.specialty,
    license: input.doctor.license,
    bio: input.doctor.bio,
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/doctors/with-user`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(payload),
    },
  );

  const txt = await res.text();
  let doctor: any = txt;
  try { doctor = JSON.parse(txt); } catch {}
  if (!res.ok) {
    throw new Error(doctor?.message || txt || 'Error al crear doctor');
  }
  return { ...doctor, user: userCreated };
}