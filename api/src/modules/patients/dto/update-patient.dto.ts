import { IsString, IsDateString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { PatientSex } from './create-patient.dto';

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(PatientSex)
  sex?: PatientSex;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}