import { IsUUID, IsDateString, IsString, IsOptional } from 'class-validator';

export class UpdatePrescriptionDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @IsOptional()
  @IsDateString()
  prescriptionDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
