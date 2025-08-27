import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { Sex } from '../patient.entity';

export class UpdatePatientDto {
  @IsOptional()
  birthDate?: string;

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @IsOptional()
  bloodType?: string;

  @IsOptional()
  allergies?: string[];

  @IsOptional()
  emergencyContact?: Record<string, any>;
}