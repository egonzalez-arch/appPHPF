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
  const user = await createUser({
    ...input.user,
    role: input.user.role || 'PATIENT',
  });

  const patient = await createPatient({
    userId: user.id,
    birthDate: input.patient.birthDate,
    PatientSex: input.patient.PatientSex,
    bloodType: input.patient.bloodType,
    allergies: input.patient.allergies,
    emergencyContact: input.patient.emergencyContact,
  } as any);

  return { ...patient, user };
}