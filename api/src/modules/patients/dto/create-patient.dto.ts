import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  IsArray,
  IsObject,
} from 'class-validator';
import { PatientSex } from './patient-sex.enum';

export class CreatePatientDto {
  @IsUUID('4')
  @IsNotEmpty()
  userId: string;

  // Mantener como string; el validador aplica correctamente
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'birthDate must be in format YYYY-MM-DD',
  })
  birthDate: string;

  @IsEnum(PatientSex)
  @IsNotEmpty()
  PatientSex: PatientSex;

  @IsOptional()
  @IsString()
  @Matches(/^(A|B|AB|O)[+-]?$/i, {
    message: 'bloodType must be valid (e.g. O+, AB-, A)',
  })
  bloodType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsObject()
  emergencyContact?: Record<string, any>;
}