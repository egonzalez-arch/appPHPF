import { createUser, CreateUserInput } from './api.users';
import { createPatient, Patient } from './api';

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

export async function createPatientWithUser(input: NewPatientCompositeInput): Promise<Patient> {
  // 1. Crear usuario
  const user = await createUser({
    ...input.user,
    role: input.user.role || 'PATIENT',
  });

  // 2. Crear paciente
  const patient = await createPatient({
    userId: user.id,
    birthDate: input.patient.birthDate,
    PatientSex: input.patient.PatientSex,
    bloodType: input.patient.bloodType,
    allergies: input.patient.allergies,
    emergencyContact: input.patient.emergencyContact,
  } as any);

  // Retorna paciente con user ya disponible si tu backend lo incluye (si no, podrías unir manualmente)
  return { ...patient, user };
}