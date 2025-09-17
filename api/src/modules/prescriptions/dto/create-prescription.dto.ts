import { IsUUID, IsDateString, IsString } from 'class-validator';

export class CreatePrescriptionDto {
  @IsUUID()
  encounterId: string; // ← AGREGAR ESTA PROPIEDAD

  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsDateString()
  prescriptionDate: string;

  @IsString()
  notes: string;
}
