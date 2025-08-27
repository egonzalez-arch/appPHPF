import { IsUUID, IsDateString, IsString, IsOptional } from 'class-validator';

export class UpdateEncounterDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @IsOptional()
  @IsDateString()
  encounterDate?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}