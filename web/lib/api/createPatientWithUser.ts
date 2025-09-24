import { createUser, CreateUserInput } from './api.users';
import { Patient } from './api';
import { sanitizePatientPayload } from './sanitizePatient';

interface NewPatientCompositeInput {
  user: CreateUserInput;
  patient: {
    birthDate: string;
    PatientSex: string;
    bloodType?: string;
    allergies?: string[];
    emergencyContact?: {
      name?: string;
      relation?: string;
      phone?: string;
    };
  };
}

async function postPatient(body: any): Promise<Patient> {
  const csrfToken =
    typeof document !== 'undefined'
      ? (document.cookie
          .split('; ')
          .find((r) => r.startsWith('csrf_token='))
          ?.split('=')[1] || '')
      : '';
  if (process.env.NODE_ENV !== 'production') {
    console.log('[postPatient] FINAL BODY SENT TO /patients:', body);
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/patients`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(body),
  });
  const txt = await res.text();
  if (!res.ok) {
    let parsed: any = txt;
    try { parsed = JSON.parse(txt); } catch {}
    throw new Error(JSON.stringify(parsed));
  }
  try {
    return JSON.parse(txt);
  } catch {
    throw new Error('Respuesta inválida del servidor al crear paciente');
  }
}

export async function createPatientWithUser(input: NewPatientCompositeInput): Promise<Patient> {
  // 1. Crear usuario
  const user = await createUser({
    ...input.user,
    role: input.user.role || 'PATIENT',
  });

  // 2. Construir y sanitizar payload de paciente
  const patientPayloadRaw = {
    userId: user.id,
    birthDate: input.patient.birthDate,
    PatientSex: input.patient.PatientSex,
    bloodType: input.patient.bloodType,
    allergies: input.patient.allergies,
    emergencyContact: input.patient.emergencyContact,
    // Nada más. NO añadir phone, ni user, ni patient.
  };

  const patientPayload = sanitizePatientPayload(patientPayloadRaw);

  // 3. Enviar
  const patient = await postPatient(patientPayload);

  return { ...patient, user };
}