import { IsUUID, IsDateString, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsDateString()
  date: string;

  @IsDateString()
  startAt: Date;

  @IsDateString()
  endAt: Date; //

  @IsString()
  reason: string;
}
