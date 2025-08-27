import { IsUUID, IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateReferralDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  referredByDoctorId?: string;

  @IsOptional()
  @IsUUID()
  referredToDoctorId?: string;

  @IsOptional()
  @IsDateString()
  referralDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}