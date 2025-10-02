import { IsUUID, IsDateString, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  clinicId: string;

  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsDateString()
  startAt: string; // ISO 8601 string

  @IsDateString()
  endAt: string;   // ISO 8601 string

  @IsString()
  reason: string;
}