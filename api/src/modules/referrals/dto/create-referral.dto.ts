import { IsUUID, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateReferralDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  referredByDoctorId: string;

  @IsUUID()
  referredToDoctorId: string;

  @IsDateString()
  referralDate: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}