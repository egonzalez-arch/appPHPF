export interface RawPatientPayload {
  userId?: string;
  birthDate?: string;
  PatientSex?: string;
  bloodType?: string;
  allergies?: string[] | null;
  emergencyContact?: Record<string, any>;
  // Campos no permitidos:
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
  const out: any = {};
  for (const key of ALLOWED) {
    if (input[key] !== undefined) out[key] = input[key];
  }
  if (process.env.NODE_ENV !== 'production') {
    const extraneous = Object.keys(input).filter(
      (k) => !(ALLOWED as string[]).includes(k),
    );
    if (extraneous.length) {
      console.warn(
        '[sanitizePatientPayload] Campos ignorados:',
        extraneous,
        'Payload original:',
        input,
      );
    }
  }
  return out;
}