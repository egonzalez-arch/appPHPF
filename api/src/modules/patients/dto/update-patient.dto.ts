import { PartialType } from '@nestjs/mapped-types';
import {
  IsOptional,
  IsEnum,
  IsString,
  Matches,
  IsArray,
  IsObject,
} from 'class-validator';
import { CreatePatientDto } from './create-patient.dto';
import { PatientSex } from './patient-sex.enum';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  // birthDate sigue siendo string opcional
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'birthDate must be in format YYYY-MM-DD',
  })
  birthDate?: string;

  @IsOptional()
  @IsEnum(PatientSex)
  PatientSex?: PatientSex;

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
