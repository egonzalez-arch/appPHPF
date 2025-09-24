import { createUser, CreateUserInput } from './api.users';
import { createPatient } from './api';
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

export async function createPatientWithUser(input: NewPatientCompositeInput): Promise<Patient> {
  const userCreated = await createUser({
    ...input.user,
    role: input.user.role || 'PATIENT',
  });

  const rawPatient = {
    userId: userCreated.id,
    birthDate: input.patient.birthDate,
    PatientSex: input.patient.PatientSex,
    bloodType: input.patient.bloodType,
    allergies: input.patient.allergies,
    emergencyContact: input.patient.emergencyContact,
  };

  const sanitized = sanitizePatientPayload(rawPatient);
  const patient = await createPatient(sanitized as any);
  return { ...patient, user: userCreated };
}