import { IsUUID, IsDateString, IsString, IsOptional } from 'class-validator';

export class CreateEncounterDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsDateString()
  encounterDate: string;

  @IsString()
  type: string;

  @IsString()
  notes: string;
}