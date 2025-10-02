import { IsEnum } from 'class-validator';
import { AppointmentStatus } from '../appointment-status-enum';

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}