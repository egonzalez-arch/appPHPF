export interface RawPatientPayload {
  userId?: string;
  birthDate?: string;
  PatientSex?: string;
  bloodType?: string;
  allergies?: string[] | null;
  emergencyContact?: Record<string, any>;
  phone?: any;
  firstName?: any;
  lastName?: any;
  email?: any;
  password?: any;
  user?: any;
  patient?: any;
  [k: string]: any;
}

const ALLOWED: (keyof RawPatientPayload)[] = [
  'userId',
  'birthDate',
  'PatientSex',
  'bloodType',
  'allergies',
  'emergencyContact',
];

export function sanitizePatientPayload(input: RawPatientPayload) {
  delete (input as any).phone;
  delete (input as any).user;
  delete (input as any).patient;
  delete (input as any).password;
  const out: any = {};
  for (const key of ALLOWED) {
    if (input[key] !== undefined) out[key] = input[key];
  }
  if (process.env.NODE_ENV !== 'production') {
    const extraneous = Object.keys(input).filter(
      (k) => !(ALLOWED as string[]).includes(k),
    );
    if (extraneous.length) {
      console.warn('[sanitizePatientPayload] Ignorados:', extraneous);
    }
  }
  return out;
}