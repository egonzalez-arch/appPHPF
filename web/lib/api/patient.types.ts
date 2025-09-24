export interface CreatePatientRequest {
  userId: string;
  birthDate: string;      // YYYY-MM-DD
  PatientSex: 'M' | 'F' | 'O';
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
}