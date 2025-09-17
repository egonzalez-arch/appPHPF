import {
  IsString,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
} from 'class-validator';

import { PatientSex } from './patient-sex.enum';

export class CreatePatientDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  birthDate: string;

  @IsEnum(PatientSex)
  sex: PatientSex;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
