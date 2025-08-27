import { IsUUID, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { Sex } from '../patient.entity';

export class CreatePatientDto {
  @IsUUID()
  userId: string;

  @IsDateString()
  birthDate: string;

  @IsEnum(Sex)
  sex: Sex;

  @IsOptional()
  bloodType?: string;

  @IsOptional()
  allergies?: string[];

  @IsOptional()
  emergencyContact?: Record<string, any>;
}