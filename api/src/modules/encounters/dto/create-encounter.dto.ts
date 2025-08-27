import { IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateEncounterDto {
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsUUID()
  clinicId: string;

  @IsOptional()
  notes?: string;
}