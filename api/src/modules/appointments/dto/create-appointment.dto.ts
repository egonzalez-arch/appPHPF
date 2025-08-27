import { IsUUID, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { AppointmentStatus } from '../appointment.entity';

export class CreateAppointmentDto {
  @IsUUID()
  clinicId: string;

  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsDateString()
  startAt: string;

  @IsDateString()
  endAt: string;

  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @IsOptional()
  reason?: string;
}